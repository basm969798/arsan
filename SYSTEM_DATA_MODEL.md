# SYSTEM_DATA_MODEL.md
Arsan — Official System Data Model (Architecture-Frozen)

------------------------------------------------------------

1. PURPOSE

This document defines the authoritative database structure.

It guarantees alignment with:

- SYSTEM_HIGH_LEVEL_ARCHITECTURE.md
- SYSTEM_STATE_MACHINE_MATRIX.md
- SYSTEM_INVARIANTS.md
- SYSTEM_EVENT_MODEL.md

The database enforces structural integrity.
The server enforces lifecycle and domain rules.

------------------------------------------------------------

2. MULTI-TENANT STRATEGY

Shared-database multi-tenancy.

Every tenant-owned table MUST contain:

company_id UUID NOT NULL

Mandatory rule:
All queries MUST filter by company_id.

Mandatory index:
INDEX(company_id)

Cross-tenant joins are forbidden.

------------------------------------------------------------

3. IDENTITY DOMAIN

companies
- id (UUID, PK)
- name
- created_at (UTC)
- updated_at (UTC)

users
- id (UUID, PK)
- email (UNIQUE)
- password_hash
- created_at (UTC)

user_company_roles
- id (UUID, PK)
- user_id (FK → users.id)
- company_id (FK → companies.id)
- role_name
- created_at (UTC)

UNIQUE(user_id, company_id, role_name)

------------------------------------------------------------

4. CATALOG DOMAIN

products (Global Technical Catalog)
- id (UUID, PK)
- name
- metadata (JSONB)
- created_at (UTC)

No company_id (global scope).

supplier_inventory
- id (UUID, PK)
- company_id (supplier FK)
- product_id (FK)
- price
- quantity
- is_available
- updated_at (UTC)

UNIQUE(company_id, product_id)
INDEX(company_id)

------------------------------------------------------------

5. ORDERS DOMAIN

5.1 Official Lifecycle States (Projection Cache Only)

NEW
WAITING_FOR_SUPPLIER
ACCEPTED
PREPARING
READY_FOR_PICKUP
RECEIVED
COMPLETED
CANCELLED

Final states:
COMPLETED
CANCELLED

NOTE:
status column is a projection cache.
Authoritative lifecycle state is derived from system_events.

------------------------------------------------------------

5.2 orders

- id (UUID, PK)
- company_id (Trader FK)
- supplier_company_id (Supplier FK, nullable initially)
- order_type (DIRECT | PUBLIC)
- status (ENUM – projection only)
- locked_price (nullable until ACCEPTED or OFFER_SELECTED)
- version (integer NOT NULL default 0)  // optimistic locking
- owner_company_id (FK → companies.id)
- created_at (UTC)
- updated_at (UTC)
- deleted_at (nullable)

INDEX(company_id)
INDEX(supplier_company_id)
INDEX(status)

------------------------------------------------------------

5.3 order_items

- id (UUID, PK)
- order_id (FK)
- product_id (FK)
- quantity
- price_snapshot (immutable after price lock)

INDEX(order_id)

------------------------------------------------------------

6. OFFERS (PUBLIC ORDERS)

offers
- id (UUID, PK)
- order_id (FK)
- supplier_company_id (FK)
- offered_price
- is_selected (boolean default false)
- created_at (UTC)

UNIQUE(order_id) WHERE is_selected = true
INDEX(order_id)
INDEX(supplier_company_id)

Rules enforced by server:
- Only one selected offer allowed
- OFFER_SELECTED event locks price
- Offer rejection does NOT change order state

------------------------------------------------------------

7. PICKUP (ATOMIC OPERATION)

order_pickup
- id (UUID, PK)
- order_id (FK UNIQUE)
- qr_code_hash
- verified_by_user_id
- verified_at (UTC)
- created_at (UTC)

Rules:

- Insert allowed only once
- Executed inside single DB transaction
- Same transaction must emit ORDER_RECEIVED event
- After RECEIVED → cancellation forbidden

------------------------------------------------------------

8. FINANCIAL DOMAIN (APPEND-ONLY LEDGER)

financial_events (Immutable)

- id (UUID, PK)
- company_id (FK)
- order_id (FK)
- event_type (CASH | DEBT | PAYMENT | TRANSFER)
- amount
- currency
- created_at (UTC)
- metadata (JSONB)

Rules:

- No UPDATE
- No DELETE
- Append-only
- Balance MUST be derived from SUM(events)
- No derived balance stored as source of truth
- Debt considered closed when computed balance = 0

INDEX(company_id)
INDEX(order_id)

------------------------------------------------------------

9. OWNERSHIP TRANSFER

ownership_transfers

- id (UUID, PK)
- order_id (FK)
- from_company_id
- to_company_id
- status (PENDING | ACCEPTED | REJECTED)
- requested_at (UTC)
- accepted_at (UTC nullable)

Rules:

- Ownership changes only when ACCEPTED
- Must emit ownership events
- Financial TRANSFER event must be emitted
- owner_company_id update is projection aligned with events
- Cross-aggregate mutation handled via Process Manager

------------------------------------------------------------

10. SYSTEM EVENT STORE (APPEND-ONLY)

system_events

- id (UUID, PK)
- aggregate_type (string)
- aggregate_id (UUID)
- event_type (string)
- company_id (UUID nullable if global)
- actor_id (UUID)
- version (integer per aggregate)
- payload (JSONB)
- created_at (UTC)

UNIQUE(aggregate_id, version)
INDEX(company_id)
INDEX(event_type)

Rules:

- Append-only
- No UPDATE
- No DELETE
- Authoritative source of lifecycle state

------------------------------------------------------------

11. IDEMPOTENCY CONTROL (PERSISTENT)

command_idempotency

- id (UUID, PK)
- aggregate_id (UUID)
- idempotency_key (string)
- created_at (UTC)

UNIQUE(aggregate_id, idempotency_key)

Prevents duplicate event emission.

------------------------------------------------------------

12. SAGA / PROCESS MANAGER STORAGE

saga_instances

- id (UUID, PK)
- saga_type
- aggregate_id
- state
- retry_count
- created_at (UTC)
- updated_at (UTC)

Internal saga state MUST NOT pollute system_events.

------------------------------------------------------------

13. LIFECYCLE ENFORCEMENT

Database provides integrity.
Server must enforce:

- No skipped states
- No illegal transitions
- No state change after final state
- No financial record before RECEIVED
- Price lock before PREPARING
- Cancellation forbidden after PREPARING

------------------------------------------------------------

14. CONCURRENCY POLICY

- orders.version used for optimistic locking
- Event store enforces sequential versioning
- Pickup inside single transaction
- Financial closing inside single transaction
- Idempotency enforced via persistent table

------------------------------------------------------------

15. SOFT DELETE POLICY

Business tables:
- deleted_at allowed

Event and financial tables:
- NEVER soft delete
- NEVER update

------------------------------------------------------------

16. MIGRATION RULES

- Versioned migrations only
- No manual production edits
- No rewriting event history
- No rewriting financial history
- Backward-compatible schema evolution required

------------------------------------------------------------

FINAL ARCHITECTURAL GUARANTEE

This data model guarantees:

- Strict tenant isolation
- Immutable financial ledger
- Deterministic lifecycle
- Atomic pickup
- Event-store authority
- Ownership integrity
- Replay safety
- Concurrency safety

Any structural violation is a critical system error.
