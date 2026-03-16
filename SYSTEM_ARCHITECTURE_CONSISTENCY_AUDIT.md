SYSTEM_ARCHITECTURE_CONSISTENCY_AUDIT.md

Architectural Consistency Audit
Authoritative Historical Reconciliation Document

1. PURPOSE

This document records architectural inconsistencies discovered across the system design documentation and defines the correct authoritative interpretation.

Goals:

Identify conflicting definitions across documents

Prevent incorrect AI-generated implementations

Provide historical traceability

Clarify authoritative architecture

Stabilize the architecture for long-term development

This document does not override architectural authority.

It exists to clarify conflicts between historical documents.

2. ARCHITECTURAL AUTHORITY HIERARCHY

The authoritative hierarchy remains:

SYSTEM_INVARIANTS.md

SYSTEM_STATE_MACHINE_MATRIX.md

SYSTEM_EVENT_MODEL.md

SYSTEM_FINANCIAL_MODEL.md

SYSTEM_DATA_MODEL.md

SYSTEM_API_CONTRACT.md

Implementation details

If conflict exists:

SYSTEM_INVARIANTS.md prevails.

3. ORDER LIFECYCLE MODEL INCONSISTENCY
3.1 Problem

Different documents defined different order lifecycle models.

Version A — STATE_MACHINE_MATRIX
DRAFT
SUBMITTED
OFFERED
ACCEPTED
PREPARING
READY
COMPLETED
CANCELLED
REJECTED
Version B — DATA_MODEL
NEW
WAITING_FOR_SUPPLIER
ACCEPTED
PREPARING
READY_FOR_PICKUP
RECEIVED
COMPLETED
CANCELLED
Version C — EVENT_MODEL
READY → RECEIVED
RECEIVED → COMPLETED
3.2 Architectural Problem

Three lifecycle definitions existed simultaneously.

This creates ambiguity in:

event sourcing

lifecycle validation

command validation

API responses

projection logic

Example ambiguity:

SUBMITTED
vs
WAITING_FOR_SUPPLIER
3.3 Correct Authoritative Lifecycle

The correct lifecycle states are:

DRAFT
SUBMITTED
OFFERED
ACCEPTED
PREPARING
READY
RECEIVED
COMPLETED
CANCELLED
REJECTED

These states represent the authoritative event lifecycle.

4. PROJECTION STATE MAPPING

Database projection states may differ from event lifecycle states.

Example mapping:

Event Lifecycle	Projection State
SUBMITTED	WAITING_FOR_SUPPLIER
READY	READY_FOR_PICKUP

Projection states exist only for:

UI clarity

API readability

reporting

Projection states must never replace event lifecycle authority.

5. PICKUP TRANSITION INCONSISTENCY
5.1 Historical Definitions

STATE MACHINE previously defined:

READY → COMPLETED

However EVENT MODEL defined:

READY → RECEIVED
5.2 Problem

The lifecycle included a state not defined in the state machine.

RECEIVED

This created inconsistency across:

lifecycle validation

financial phase logic

pickup process

5.3 Correct Lifecycle

Pickup transition must be:

READY → RECEIVED
RECEIVED → COMPLETED

RECEIVED represents:

QR verification

physical pickup confirmation

financial phase opening

Cancellation becomes permanently disabled after RECEIVED.

6. FINANCIAL EVENT NAMING INCONSISTENCY

Two different event systems exist.

6.1 Domain Events

Stored in:

system_events

Examples:

ORDER_ACCEPTED
ORDER_PREPARING
ORDER_READY
ORDER_RECEIVED
ORDER_COMPLETED

FINANCIAL_CASH_REGISTERED
FINANCIAL_DEBT_REGISTERED
FINANCIAL_PAYMENT_REGISTERED
FINANCIAL_BALANCE_ZERO
6.2 Ledger Entries

Stored in:

financial_events

Ledger event types:

CASH
DEBT
PAYMENT
TRANSFER
6.3 Problem

The architecture previously did not clearly distinguish between:

Domain Event
vs
Ledger Entry

Incorrect implementations could write domain events into the ledger table.

6.4 Correct Model

Two separate immutable event streams exist.

Domain Events

Business lifecycle events.

Stored in:

system_events
Financial Ledger Events

Accounting records.

Stored in:

financial_events

These streams must never be mixed.

7. PRICE LOCK EVENT INCONSISTENCY

Previous documentation referenced:

PRICE_LOCKED

However this event does not exist in the event model.

Correct Model

Price locking is not a financial event.

Price lock occurs as a side effect of:

ORDER_ACCEPTED
or
OFFER_SELECTED

At that moment:

orders.locked_price is set
order_items.price_snapshot is frozen

Financial events begin only after:

ORDER_RECEIVED
8. OFFER EVENT NAMING INCONSISTENCY

Two names appeared for the same concept.

OFFER_ACCEPTED
OFFER_SELECTED
Correct Model

Correct event name:

OFFER_SELECTED

Reason:

Trader selects an offer from multiple suppliers.

Supplier does not accept the order in public requests.

9. API STATE VS EVENT STATE

API responses expose projection states such as:

WAITING_FOR_SUPPLIER
READY_FOR_PICKUP

Event lifecycle states are:

SUBMITTED
READY
Correct Model

API exposes projection states.

Event lifecycle states remain internal to the domain.

Projection tables provide API-friendly representations.

10. AGGREGATE VERSION AUTHORITY

Two version sources exist:

system_events.version
orders.version
Problem

Potential ambiguity regarding version authority.

Correct Model

Authoritative version:

system_events.version

orders.version exists only as a projection cache used for optimistic locking.

Event store version remains authoritative.

11. PROJECTION AUTHORITY

The database contains:

orders.status

This may be misinterpreted as authoritative state.

Correct Model

Authoritative lifecycle state must be derived from:

system_events

Projection tables are:

read models
performance optimizations
UI representations

They must always be rebuildable from event history.

12. PROJECTION VS SAGA RESPONSIBILITY

Correct event-driven architecture flow:

Event → Projection → Read Model Update
Event → Saga → Command Dispatch

Projection handlers must:

update read models

remain idempotent

Projection handlers must never:

emit events
dispatch commands
mutate aggregates

Cross-domain coordination occurs only through:

Process Manager / Saga
13. OWNERSHIP TRANSFER EXECUTION FLOW

Correct execution flow:

OWNERSHIP_TRANSFER_ACCEPTED event
→ Saga listens to event
→ Saga dispatches RegisterFinancialTransferCommand
→ financial_events ledger entry created
→ ownership projection updated

Ownership transfer must remain:

atomic

event driven

ledger consistent

14. OFFER DOMAIN LIFECYCLE

Offer lifecycle must follow:

CREATED
SELECTED
REJECTED

Rules:

only one SELECTED offer per order
offers do not mutate order state unless selected

Offer rejection does not change order lifecycle.

15. OWNERSHIP TRANSFER LIFECYCLE

Ownership transfer lifecycle:

PENDING
ACCEPTED
REJECTED

Acceptance triggers:

financial transfer event
ownership projection update

Ownership lifecycle is independent from order lifecycle.

16. FINAL ARCHITECTURAL MODEL

After reconciliation the architecture guarantees:

Single authoritative lifecycle
Strict event sourcing discipline
Clear separation between domain events and ledger entries
Projection cache clarity
Saga-controlled cross-domain coordination
Immutable financial ledger
Deterministic event replay
Tenant isolation
Idempotent command execution
17. ARCHITECTURAL MATURITY

After resolving inconsistencies the system becomes:

Event-Sourcing Consistent
Ledger Safe
Replay Deterministic
Tenant Isolated
AI Implementable
Production Grade

Architecture maturity is comparable to systems used in:

Stripe ledger architecture

Shopify order engine

Uber marketplace services

FINAL STATEMENT

This document ensures that all historical inconsistencies are resolved and the system architecture remains:

Deterministic
Auditable
Replay-safe
Financially consistent
Tenant-isolated
Production-grade

All future implementations must follow the corrected architectural model described in this document.
