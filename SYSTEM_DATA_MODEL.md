SYSTEM_DATA_MODEL.md
Arsan — Official System Data Model (Architecture-Aligned)
1. Purpose

This document defines the authoritative database structure for Arsan.

It guarantees alignment with:

Order lifecycle rules

Event-based architecture

Financial immutability

Multi-tenant isolation

Ownership transfer model

Atomic pickup operation

The database enforces structural integrity.
The server enforces transition rules.

2. Multi-Tenant Strategy

Arsan uses shared-database multi-tenancy.

Every tenant-owned table MUST contain:

company_id UUID NOT NULL

Mandatory rule:

WHERE company_id = currentTenant

Mandatory index:

INDEX(company_id)

Cross-tenant joins are forbidden.

3. Identity Domain
companies

id (UUID, PK)

name

created_at

updated_at

users

id (UUID, PK)

email (UNIQUE)

password_hash

created_at

user_company_roles

id (UUID, PK)

user_id (FK → users.id)

company_id (FK → companies.id)

role_name

created_at

Composite index:
(user_id, company_id)

4. Catalog Domain
products (Global Technical Catalog)

id (UUID, PK)

name

metadata (JSONB)

created_at

No company_id (global scope).

supplier_inventory

id (UUID, PK)

company_id (supplier FK)

product_id (FK)

price

quantity

is_available

updated_at

Composite index:
(company_id, product_id)

5. Orders Domain
5.1 Order Status Enum

Official lifecycle states:

NEW

WAITING_FOR_SUPPLIER

ACCEPTED

PREPARING

READY_FOR_PICKUP

RECEIVED

COMPLETED

REJECTED

CANCELLED

Final states:

COMPLETED

REJECTED

CANCELLED

No transitions allowed after final states.

5.2 orders

id (UUID, PK)

company_id (Trader FK)

supplier_company_id (Supplier FK, nullable initially)

order_type (DIRECT | PUBLIC)

status (ENUM — above)

locked_price (nullable until locked)

version (integer for optimistic locking)

owner_company_id (FK — for ownership transfer)

created_at

updated_at

deleted_at (nullable)

Indexes:
(company_id)
(supplier_company_id)
(status)

5.3 order_items

id (UUID, PK)

order_id (FK)

product_id (FK)

quantity

price_snapshot (immutable after lock)

Index:
(order_id)

6. Offers (Public Orders)
offers

id (UUID, PK)

order_id (FK)

supplier_company_id (FK)

offered_price

is_selected (boolean default false)

created_at

Constraint:
Only ONE offer can have is_selected = true per order.

Index:
(order_id)
(supplier_company_id)

7. Pickup Atomic Operation

Pickup must be atomic.

order_pickup

id (UUID, PK)

order_id (FK UNIQUE)

qr_code_hash

verified_by_user_id

verified_at

created_at

Rules:

Insert only once

Must execute inside DB transaction

After insert → order.status = RECEIVED

After RECEIVED → no cancellation allowed

8. Financial Domain (Append-Only)
financial_events

Immutable table.

id (UUID, PK)

company_id (FK)

order_id (FK)

event_type (CASH | DEBT | PAYMENT | TRANSFER)

amount

balance_after

created_at

metadata (JSONB)

Rules:

No UPDATE

No DELETE

Append-only

balance_after must be deterministic

Debt closes when:
balance_after = 0

Index:
(company_id)
(order_id)

9. Ownership Transfer

Ownership is independent of lifecycle.

ownership_transfers

id (UUID, PK)

order_id (FK)

from_company_id

to_company_id

status (PENDING | ACCEPTED | REJECTED)

requested_at

accepted_at (nullable)

Rules:

Ownership changes only when ACCEPTED

Financial event (TRANSFER) must be created

owner_company_id in orders must update atomically

10. System Event Log (Append-Only)
system_events

id (UUID, PK)

aggregate_type

aggregate_id

event_type

payload (JSONB)

actor_id

created_at

Append-only.

State is derived from events + transition rules.

11. Saga / Process Manager
saga_instances

id (UUID, PK)

saga_type

aggregate_id

state

created_at

updated_at

Used for:

Cross-domain coordination

Long-running workflows

Ownership transfer

Financial coordination

12. Lifecycle Enforcement Rules

Server must validate:

No skipping states

No illegal transitions

No state changes after final state

Pickup must happen before financial closing

Price locking must happen before PREPARING

Database supports integrity.
Server enforces transitions.

13. Concurrency Policy

version column in orders (optimistic locking)

Pickup inside transaction

Financial closing inside transaction

Idempotency keys stored in Redis

14. Soft Delete Policy

Business tables:

deleted_at allowed

Financial tables:

NEVER soft delete

NEVER update

15. Migration Rules

Versioned migrations only

No manual production edits

Backward compatible schema changes

Never rewrite financial history

Final Architectural Guarantee

This data model guarantees:

Strict tenant isolation

Immutable financial system

Controlled lifecycle

Atomic pickup

Event-driven integrity

Ownership transfer correctness

Concurrency safety

Violations are critical security issues.
