# Arsan — Official System Event Model (Final)

## 1. Purpose

This document defines the authoritative Event Model for Arsan.

Arsan follows an event-driven architecture where:

- Events are immutable
- Events are append-only
- Events are the historical source of truth
- State is derived from events
- Financial records are event-based
- Cross-domain coordination uses saga patterns

This document governs:

- Event structure
- Event types
- Storage rules
- Emission rules
- Ordering guarantees
- Idempotency rules
- Projection rules
- Integrity constraints

---

## 2. Core Event Principles

1. Events are immutable.
2. Events are append-only.
3. Events must be deterministic.
4. Events must be tenant-aware when applicable.
5. Events must not contain secrets.
6. Events must represent a completed state transition.
7. Critical business transitions must emit events.

Any violation is considered a critical system failure.

---

## 3. Event Storage Model

All system events are stored in:

Table: system_events

Columns:

- id (UUID, PK)
- aggregate_type (string)          // e.g., Order
- aggregate_id (UUID)              // entity ID
- event_type (string)
- company_id (UUID, nullable if global)
- actor_id (UUID)
- version (integer)                // per aggregate version
- payload (JSONB)
- created_at (timestamp)

Indexes:

- INDEX(aggregate_id)
- INDEX(company_id)
- INDEX(event_type)
- UNIQUE(aggregate_id, version)

Rules:

- No UPDATE allowed
- No DELETE allowed
- Append-only only
- Version increments per aggregate

---

## 4. Standard Event Envelope

All events must follow this structure:

{
  "eventId": "uuid",
  "aggregateType": "Order",
  "aggregateId": "uuid",
  "eventType": "ORDER_ACCEPTED",
  "companyId": "uuid",
  "actorId": "uuid",
  "version": 3,
  "timestamp": "ISO8601",
  "payload": {}
}

Definitions:

- eventId → Unique identifier
- aggregateType → Domain entity name
- aggregateId → Entity identifier
- eventType → Business event name
- companyId → Tenant scope
- actorId → User/system actor
- version → Sequential version per aggregate
- timestamp → Event creation time
- payload → Event-specific structured data

---

## 5. Order Domain Events

### 5.1 Creation

- ORDER_CREATED
- PUBLIC_ORDER_CREATED

---

### 5.2 Supplier Interaction

- ORDER_ACCEPTED
- ORDER_REJECTED
- OFFER_SUBMITTED
- OFFER_SELECTED

Rules:

- OFFER_SELECTED locks price
- ORDER_ACCEPTED locks price
- Only one offer may be selected

---

### 5.3 Preparation Phase

- ORDER_PREPARING
- ORDER_READY_FOR_PICKUP

State transitions must follow lifecycle rules.

---

### 5.4 Pickup (Atomic)

Pickup must emit, inside one transaction:

1. ORDER_PICKUP_VERIFIED
2. ORDER_RECEIVED

Rules:

- QR must be validated
- Event ordering must be preserved
- After ORDER_RECEIVED → cancellation forbidden

---

### 5.5 Cancellation

- ORDER_CANCELLED

Allowed only before RECEIVED.

---

### 5.6 Completion

- ORDER_COMPLETED

Triggered when:

- Cash closing completed
OR
- Debt fully paid

No transitions allowed after completion.

---

## 6. Financial Domain Events

Financial operations must emit system events and store immutable financial records.

Financial event types:

- FINANCIAL_CASH_REGISTERED
- FINANCIAL_DEBT_REGISTERED
- FINANCIAL_PAYMENT_REGISTERED
- FINANCIAL_TRANSFER_REGISTERED

Rules:

- financial_events table is append-only
- No mutation allowed
- Balance must be deterministic
- Completion event must emit when balance reaches zero

---

## 7. Ownership Transfer Events

- OWNERSHIP_TRANSFER_REQUESTED
- OWNERSHIP_TRANSFER_ACCEPTED
- OWNERSHIP_TRANSFER_REJECTED

Acceptance must:

- Update order.owner_company_id
- Insert financial TRANSFER event
- Emit system event
- Execute atomically

---

## 8. Saga / Process Manager Events

Long-running workflows must emit:

- SAGA_STARTED
- SAGA_STEP_COMPLETED
- SAGA_COMPLETED
- SAGA_FAILED

Saga instances must track:

- saga_type
- aggregate_id
- current_state
- retry_count

Saga must never violate lifecycle integrity.

---

## 9. Idempotency Rules

Critical operations require idempotency:

- Pickup
- Financial closing
- Payment registration
- Ownership transfer acceptance

Rules:

- Client sends Idempotency-Key
- Server validates uniqueness
- Duplicate processing forbidden
- No duplicate events allowed

Event emission must be exactly-once per logical action.

---

## 10. Event Ordering Guarantees

Events must maintain strict ordering per aggregate.

Rules:

- Version increments sequentially
- No skipped versions
- No parallel writes for same aggregate
- Optimistic locking enforced

Out-of-order transitions forbidden.

---

## 11. Derived State & Projections

Order state (orders.status) is a projection.

Authoritative source:

system_events

Projection rules must:

- Be deterministic
- Be rebuildable
- Support event replay

Replaying events must reconstruct correct state.

---

## 12. Event Replay Policy

System must support:

- Rebuilding projections
- Recomputing balances
- Auditing lifecycle transitions

Replay allowed only in controlled environments.

No replay in live production without safeguards.

---

## 13. Security & Data Protection

Events must NOT store:

- Passwords
- JWT tokens
- Payment secrets
- Sensitive financial credentials

Payload must contain minimal required data.

Events are auditable records.

---

## 14. Integrity Guarantees

The Event Model guarantees:

- Immutable historical integrity
- Deterministic lifecycle transitions
- Financial immutability alignment
- Tenant isolation
- Atomic pickup enforcement
- Safe ownership transfers
- Reliable saga coordination
- Strict event ordering
- Safe idempotent operations

Any violation of immutability, ordering, or tenant isolation is a critical system error.
