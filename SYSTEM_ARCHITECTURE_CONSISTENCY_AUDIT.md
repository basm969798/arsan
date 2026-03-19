SYSTEM_ARCHITECTURE_CONSISTENCY_AUDIT.md

Architectural Consistency Audit
Authoritative Historical Reconciliation Document

1. PURPOSE

This document records architectural inconsistencies discovered across system design documents and defines the final authoritative resolutions.

Goals

Identify conflicting definitions across documents

Prevent incorrect AI-generated implementations

Provide historical traceability

Clarify and enforce authoritative architecture

Stabilize the system for long-term development

Authority Note

This document does NOT override SYSTEM_INVARIANTS.md.

However:

All resolutions defined here are MANDATORY and must be enforced across all implementations.

2. ARCHITECTURAL AUTHORITY HIERARCHY

The authoritative hierarchy remains:

SYSTEM_INVARIANTS.md

SYSTEM_STATE_MACHINE_MATRIX.md

SYSTEM_EVENT_MODEL.md

SYSTEM_FINANCIAL_MODEL.md

SYSTEM_DATA_MODEL.md

SYSTEM_API_CONTRACT.md

Implementation details

Rule

If conflict exists:

SYSTEM_INVARIANTS.md PREVAILS

3. ORDER LIFECYCLE MODEL INCONSISTENCY
3.1 Problem

Multiple conflicting lifecycle definitions existed:

STATE MACHINE

DRAFT

SUBMITTED

OFFERED

ACCEPTED

PREPARING

READY

COMPLETED

CANCELLED

REJECTED

DATA MODEL

NEW

WAITING_FOR_SUPPLIER

ACCEPTED

PREPARING

READY_FOR_PICKUP

RECEIVED

COMPLETED

CANCELLED

EVENT MODEL

READY → RECEIVED

RECEIVED → COMPLETED

3.2 Architectural Impact

This caused ambiguity in:

Event sourcing

Lifecycle validation

Command validation

API responses

Projection logic

3.3 Resolution (MANDATORY)

The single authoritative lifecycle is:

DRAFT
→ SUBMITTED
→ OFFERED
→ ACCEPTED
→ PREPARING
→ READY
→ RECEIVED
→ COMPLETED
→ CANCELLED
→ REJECTED
Rules

MUST be used in all domain logic

MUST be enforced in aggregates

MUST be reflected in SYSTEM_STATE_MACHINE_MATRIX.md

Any deviation is INVALID

4. PROJECTION STATE MAPPING

Projection states may differ from lifecycle states.

Example
Event State	Projection State
SUBMITTED	WAITING_FOR_SUPPLIER
READY	READY_FOR_PICKUP
Rules (MANDATORY)

Projections are read models only

MUST NOT contain business logic

MUST NOT define lifecycle authority

Event lifecycle is the single source of truth

Violation = critical architectural failure

5. PICKUP TRANSITION INCONSISTENCY
Problem

Mismatch:

READY → COMPLETED
vs

READY → RECEIVED → COMPLETED

Resolution (MANDATORY)
READY → RECEIVED → COMPLETED
RECEIVED Represents

QR validation

Physical pickup

Financial phase activation

Rules

Cancellation is FORBIDDEN after RECEIVED

Financial operations start ONLY after RECEIVED

6. DOMAIN EVENTS VS LEDGER EVENTS
Problem

Confusion between:

Domain events

Financial (ledger) events

Resolution (MANDATORY)

Two strictly separate systems:

Domain Events

Stored in: system_events

Represent business lifecycle

Examples:

ORDER_ACCEPTED

ORDER_READY

ORDER_RECEIVED

ORDER_COMPLETED

Financial Ledger Events

Stored in: financial_events

Represent accounting records

Types:

CASH

DEBT

PAYMENT

TRANSFER

Rules

Domain events MUST NOT be stored in financial_events

Ledger events MUST NOT be stored in system_events

Mixing = critical data integrity violation

7. PRICE LOCK MODEL
Problem

Undefined event: PRICE_LOCKED

Resolution (MANDATORY)

Price locking is NOT an event

Occurs as a side effect of:

ORDER_ACCEPTED

OFFER_SELECTED

Rules

locked_price MUST be immutable

price_snapshot MUST be frozen

No recalculation allowed

Financial phase starts only after RECEIVED

8. OFFER EVENT NAMING
Problem

OFFER_ACCEPTED

OFFER_SELECTED

Resolution (MANDATORY)

Correct event:

OFFER_SELECTED

Rules

MUST be used everywhere

OFFER_ACCEPTED is INVALID

9. API STATE VS EVENT STATE
Problem

API exposes projection states.

Resolution (MANDATORY)

API MUST expose projection states

Domain MUST use event lifecycle states

Mapping MUST be explicit

10. AGGREGATE VERSION AUTHORITY
Problem

system_events.version

orders.version

Resolution (MANDATORY)

Authoritative source:

system_events.version

Rules

orders.version = projection cache only

MUST NOT be used as source of truth

11. PROJECTION AUTHORITY
Resolution (MANDATORY)

system_events = source of truth

Rules

Projections MUST be rebuildable

MUST be idempotent

Direct mutation is FORBIDDEN

12. PROJECTION VS SAGA RESPONSIBILITY
Event Flow
Event → Projection → Read Model
Event → Saga → Command
Rules
Projection MUST NOT:

Emit events

Dispatch commands

Mutate aggregates

Saga:

ONLY component allowed to dispatch commands

13. OWNERSHIP TRANSFER FLOW
Execution Flow
OWNERSHIP_TRANSFER_ACCEPTED
→ Saga
→ RegisterFinancialTransferCommand
→ Ledger Entry
→ Projection Update
Requirements

Atomic

Event-driven

Financially consistent

14. OFFER LIFECYCLE
CREATED
→ SELECTED
→ REJECTED
Rules

Only ONE selected offer per order

Rejection MUST NOT affect order lifecycle

15. OWNERSHIP LIFECYCLE
PENDING
→ ACCEPTED
→ REJECTED
Rules

ACCEPTED triggers financial transfer

Independent from order lifecycle

16. CODE-LEVEL CONSISTENCY RULES
16.1 Event Naming (MANDATORY)
OFFER_SELECTED → offer-selected.event.ts
16.2 Aggregate Structure (MANDATORY)

All aggregates MUST be event-sourced.

Required methods:

replayEvents()

applyEvent()

getUncommittedEvents()

Direct mutation is FORBIDDEN

16.3 Projection Location (MANDATORY)
src/projections/{domain}/

NOT allowed:

domain/

application/

16.4 Financial Separation (MANDATORY)
financial_events ≠ system_events
16.5 Folder Structure (MANDATORY)
src/
 ├── api/
 ├── application/
 ├── domain/
 ├── infrastructure/
 ├── projections/
 └── shared/
16.6 Module Structure (MANDATORY)
src/modules/{domain}/
  ├── domain/
  ├── application/
  ├── infrastructure/
  ├── projections/
16.7 Event Flow (MANDATORY)

Only Sagas may dispatch commands
Projections MUST NEVER dispatch commands

17. FINAL ARCHITECTURAL GUARANTEES

After applying all resolutions:

Single lifecycle definition

Strict event sourcing

Immutable financial ledger

Clear separation of concerns

Deterministic replay

Tenant isolation

Idempotent execution

18. FINAL ARCHITECTURAL MODEL

The system is:

Event-Sourcing consistent

Ledger-safe

Replay deterministic

Tenant-isolated

AI-implementable

Production-grade

Comparable to:

Stripe ledger architecture

Shopify order engine

Uber marketplace systems

19. FINAL RESOLUTION DECISIONS (AUTHORITATIVE)
Lifecycle
DRAFT → SUBMITTED → OFFERED → ACCEPTED → PREPARING → READY → RECEIVED → COMPLETED
Event Authority

SYSTEM_EVENT_MODEL.md is the source of truth

Financial Separation
system_events ≠ financial_events
Aggregate Model

All aggregates MUST be event-sourced

Projection Authority
system_events = source of truth
Execution Flow
Event → Saga → Command → Event
FINAL STATEMENT

This document defines the authoritative resolved architecture.

Any implementation that violates these rules is:

INVALID

ARCHITECTURALLY UNSAFE

REQUIRES CORRECTION
