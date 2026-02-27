# SYSTEM_EVENT_MODEL.md

AUTHORITATIVE EVENT MODEL

------------------------------------------------------------

1. PURPOSE

This document defines the authoritative Event Model.

The system follows strict event-driven architecture where:

- Events are immutable
- Events are append-only
- Events are historical source of truth
- State is derived from events
- Financial integrity is event-based
- Cross-domain coordination uses Process Manager (Saga pattern)

If conflict exists with implementation:
SYSTEM_INVARIANTS.md prevails.

------------------------------------------------------------

2. CORE EVENT PRINCIPLES

1. Events are immutable.
2. Events are append-only.
3. Events represent completed business transitions.
4. Events must be deterministic.
5. Events must be tenant-aware when applicable.
6. Events must NOT contain secrets.
7. Events must NOT contain derived values.
8. Critical domain transitions MUST emit events.

Violation is a critical system error.

------------------------------------------------------------

3. EVENT STORAGE MODEL

Table: system_events

Columns:

- id (UUID, PK)
- aggregate_type (string)
- aggregate_id (UUID)
- event_type (string)
- company_id (UUID, nullable if global)
- actor_id (UUID)
- version (integer, per aggregate)
- payload (JSONB)
- created_at (timestamp, UTC)

Indexes:

- INDEX(aggregate_id)
- INDEX(company_id)
- INDEX(event_type)
- UNIQUE(aggregate_id, version)

Rules:

- UPDATE forbidden
- DELETE forbidden
- Version increments sequentially per aggregate
- No skipped versions
- Optimistic locking mandatory

------------------------------------------------------------

4. STANDARD EVENT ENVELOPE

{
  "eventId": "uuid",
  "aggregateType": "Order",
  "aggregateId": "uuid",
  "eventType": "ORDER_ACCEPTED",
  "companyId": "uuid",
  "actorId": "uuid",
  "version": 3,
  "timestamp": "ISO8601 UTC",
  "payload": {}
}

Event type names are immutable.
Renaming event types is forbidden.

------------------------------------------------------------

5. ORDER DOMAIN EVENTS

Order lifecycle MUST align strictly with SYSTEM_STATE_MACHINE_MATRIX.md.

------------------------------------------------------------

5.1 Creation

- ORDER_CREATED
- PUBLIC_ORDER_CREATED

------------------------------------------------------------

5.2 Acceptance Phase

Direct Order:

- ORDER_ACCEPTED

Public Request Order:

- OFFER_SUBMITTED
- OFFER_SELECTED

Rules:

- OFFER_SELECTED locks price.
- ORDER_ACCEPTED locks price.
- For Public Request Orders:
  ORDER_ACCEPTED MUST NOT be emitted.
- Only one OFFER_SELECTED allowed per order.
- Rejected offers DO NOT change order state.

Optional non-lifecycle event:

- SUPPLIER_REJECTED_ORDER

This event does NOT modify order state.

------------------------------------------------------------

5.3 Preparation Phase

- ORDER_PREPARING
- ORDER_READY

Events MUST follow lifecycle transition rules.

------------------------------------------------------------

5.4 Pickup (Atomic Transition)

Transition: READY → RECEIVED

Single event emitted:

- ORDER_RECEIVED

Rules:

- QR validation occurs inside same transaction.
- No intermediate event allowed.
- Cancellation permanently disabled after this event.

------------------------------------------------------------

5.5 Cancellation

- ORDER_CANCELLED

Allowed only before PREPARING.
Forbidden after RECEIVED.

------------------------------------------------------------

5.6 Completion

- ORDER_COMPLETED

Triggered ONLY by Process Manager after:

- Cash closing confirmed
OR
- Financial balance reaches zero

Financial domain MUST NOT directly mutate order.

------------------------------------------------------------

6. FINANCIAL DOMAIN EVENTS

Financial domain emits events independently.

Financial events:

- FINANCIAL_CASH_REGISTERED
- FINANCIAL_DEBT_REGISTERED
- FINANCIAL_PAYMENT_REGISTERED
- FINANCIAL_TRANSFER_REGISTERED
- FINANCIAL_BALANCE_ZERO

Rules:

- financial_events table is append-only.
- No UPDATE.
- No DELETE.
- Balance derived strictly from ledger events.
- FINANCIAL_BALANCE_ZERO emitted when outstanding balance = 0.

Process Manager listens to FINANCIAL_BALANCE_ZERO
→ Emits ORDER_COMPLETED.

------------------------------------------------------------

7. OWNERSHIP TRANSFER EVENTS

- OWNERSHIP_TRANSFER_REQUESTED
- OWNERSHIP_TRANSFER_ACCEPTED
- OWNERSHIP_TRANSFER_REJECTED

Acceptance must execute atomically:

- Change ownership
- Insert financial transfer event
- Emit system event

Cross-aggregate mutation only via Process Manager.

------------------------------------------------------------

8. PROCESS MANAGER / SAGA RULES

Process Manager:

- Listens to domain events
- Dispatches commands
- Ensures cross-domain consistency

Internal saga state MUST NOT pollute system_events.

Saga state stored separately in saga_instances table.

Saga must NEVER violate lifecycle or invariants.

------------------------------------------------------------

9. IDEMPOTENCY RULES

Critical commands requiring idempotency:

- Pickup
- Financial closing
- Payment registration
- Ownership acceptance

Implementation requirements:

- Client sends Idempotency-Key
- Server stores key per aggregate
- UNIQUE(aggregate_id, idempotency_key)
- Duplicate command MUST NOT emit new event

Exactly one event per logical action.

------------------------------------------------------------

10. EVENT ORDERING GUARANTEES

- Strict ordering per aggregate
- Version increments sequentially
- No parallel writes
- Optimistic concurrency enforced

Out-of-order transitions forbidden.

------------------------------------------------------------

11. PROJECTIONS & DERIVED STATE

Order.status is a projection.

Authoritative source:
system_events

Projection rules:

- Deterministic
- Rebuildable
- Idempotent
- Replay-safe

Event replay MUST reconstruct identical state.

------------------------------------------------------------

12. EVENT REPLAY POLICY

System must support:

- Projection rebuild
- Ledger recomputation
- Full audit reconstruction

Replay allowed only in controlled environments.

Replay MUST NOT:

- Trigger external side effects
- Send notifications
- Re-execute integrations

------------------------------------------------------------

13. SECURITY RULES

Events MUST NOT contain:

- Passwords
- JWT tokens
- Payment secrets
- Sensitive credentials

Payload must contain minimal required data.

Events are permanent audit artifacts.

------------------------------------------------------------

14. INTEGRITY GUARANTEES

The Event Model guarantees:

- Immutable history
- Deterministic lifecycle
- Financial integrity alignment
- Tenant isolation enforcement
- Strict ordering
- Idempotent command handling
- Atomic pickup transition
- Safe cross-domain coordination

Any violation of immutability, ordering, or tenant isolation
is a critical system failure.
