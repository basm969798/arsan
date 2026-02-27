# SYSTEM_ARCHITECTURE_REVISION.md

Architecture Revision — Hybrid Model Adoption

------------------------------------------------------------

1. PURPOSE

This document officially revises the architectural strategy of Arsan.

The system will adopt a:

Hybrid Transactional Core + Immutable Financial Ledger + Audit Event Log

This replaces full Event Sourcing as primary state authority.

The goal is:

- Lower implementation complexity
- Reduce AI execution risk
- Preserve financial immutability
- Maintain lifecycle determinism
- Reduce operational overhead
- Enable faster delivery

------------------------------------------------------------

2. ARCHITECTURAL SHIFT

Previous Model:
State derived entirely from events (Event Sourcing).

Revised Model:
State stored directly in transactional tables.
Events serve as audit records only.

This change does NOT affect:

- Financial immutability
- Lifecycle rules
- Tenant isolation
- Authorization enforcement
- State transition validation

------------------------------------------------------------

3. NEW CORE PRINCIPLES

3.1 Transactional State Authority

The authoritative source of order state is:

orders.status column

State transitions:

- Validated in Domain Layer
- Persisted transactionally
- Recorded in audit log

State is NOT rebuilt from event history.

------------------------------------------------------------

3.2 Audit Event Log (Non-Authoritative)

system_events table:

- Append-only
- Immutable
- Used for:
  - Audit
  - Debugging
  - Traceability
  - Compliance

Events are NOT used to reconstruct aggregate state.

------------------------------------------------------------

3.3 Financial Ledger Remains Immutable

financial_events table:

- Append-only
- Immutable
- Deterministic balance derived from ledger
- Source of truth for financial state

Financial model remains unchanged.

------------------------------------------------------------

4. PROCESS MANAGER SIMPLIFICATION

Process Manager remains, but:

- Operates on transactional state
- Reacts to domain events
- Does NOT rebuild aggregates
- Does NOT perform event replay

Cross-domain coordination remains controlled and explicit.

------------------------------------------------------------

5. DOMAIN MODEL IMPACT

Order Aggregate:

- Stores state internally
- Validates transitions
- Emits audit events
- Persists status directly

No event rehydration required.

------------------------------------------------------------

6. INFRASTRUCTURE SIMPLIFICATION

Removed requirements:

- Event replay engine
- Aggregate rehydration from event store
- Event version sequencing per aggregate
- Snapshotting logic

Retained:

- Optimistic locking (orders.version)
- Append-only financial ledger
- Append-only audit log
- Strict transition enforcement

------------------------------------------------------------

7. BACKEND LAYER STRUCTURE (CONFIRMED)

Backend layers:

1. API Layer
2. Application Layer (Use Cases)
3. Domain Layer (Aggregates + State Machine)
4. Infrastructure Layer (DB, Redis, Services)
5. Audit & Financial Persistence

No dedicated Event Store layer required.

------------------------------------------------------------

8. FRONTEND ALIGNMENT

Frontend remains:

- Server-authoritative
- State-reflective
- Command-based
- Role-aware

No lifecycle decisions in UI.

------------------------------------------------------------

9. COST & RISK REDUCTION

This revision:

- Reduces code complexity
- Reduces AI hallucination risk
- Reduces transactional edge cases
- Removes replay-related risks
- Simplifies disaster recovery
- Simplifies scaling
- Preserves deterministic behavior

------------------------------------------------------------

10. WHAT REMAINS STRICT

The following are unchanged and mandatory:

- Final states immutable
- Price locking at acceptance
- Financial events append-only
- No mutation of ledger
- No illegal transitions
- Tenant isolation mandatory
- Authorization at domain level
- Idempotent critical operations

------------------------------------------------------------

FINAL ARCHITECTURE STATEMENT

Arsan uses:

Transactional Core
+ Immutable Financial Ledger
+ Append-only Audit Log
+ Strict State Machine
+ Tenant-Scoped RBAC
+ Optimistic Concurrency

Event Sourcing is NOT the primary state authority.

This architecture is intentional,
controlled,
and cost-efficient.

This revision supersedes prior Event-Sourcing assumptions.
