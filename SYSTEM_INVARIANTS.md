# SYSTEM_INVARIANTS.md

NON-NEGOTIABLE ARCHITECTURAL INVARIANTS

0. PURPOSE & AUTHORITY

This document defines the absolute architectural invariants of the system.

These invariants:

- Apply to all services, modules, agents, jobs, APIs, and integrations.
- Override any conflicting implementation detail.
- Are mandatory for both human and AI-generated implementations.

If implementation conflicts with this document:
THIS DOCUMENT PREVAILS.

------------------------------------------------------------

1. SYSTEM DEFINITIONS

Tenant = A company (isolated business boundary).
Aggregate = A transactional consistency boundary.
Event = An immutable record describing something that happened.
Financial Event = An immutable ledger entry affecting monetary state.
Derived State = Any state computed from events or validated transitions.

------------------------------------------------------------

2. MULTI-TENANCY INVARIANTS

2.1 Tenant Isolation

- Every tenant-owned domain table MUST contain company_id.
- All queries MUST be filtered by company_id.
- Cross-tenant data access is strictly forbidden.
- No shared mutable state between tenants.
- Caches MUST be tenant-aware.

2.2 Database Enforcement

- company_id MUST be indexed.
- Composite indexes MUST include company_id where applicable.
- Foreign keys MUST NOT allow cross-tenant references.
- No domain entity may exist without tenant ownership unless explicitly marked as system-level.
- Background jobs MUST enforce tenant context.

------------------------------------------------------------

3. AGGREGATE BOUNDARY INVARIANTS

- Aggregates MUST NOT directly mutate other aggregates.
- Cross-aggregate coordination MUST occur ONLY via:
  - Domain events
  - Process Manager orchestration
- No aggregate may bypass its own validation rules.
- All aggregate mutations MUST occur via domain commands.

------------------------------------------------------------

4. EVENT INTEGRITY INVARIANTS

4.1 Event Immutability

- All domain events are append-only.
- UPDATE is forbidden.
- DELETE is forbidden.
- Corrections MUST use compensating events.
- Event schema versioning MUST be supported.

4.2 Event Ordering & Concurrency

- Events MUST maintain strict ordering per aggregate.
- Aggregate version or sequence number is mandatory.
- Optimistic concurrency control MUST prevent race conditions.
- Out-of-order state mutation is forbidden.

4.3 State Derivation

Domain state MUST be derived from:

- Events
OR
- Validated state transitions that emit events.

Direct mutation bypassing event logic is forbidden.

Projections MUST be fully rebuildable from event history.

Projection handlers MUST be idempotent.

Event replay MUST NOT produce duplicate side effects.

------------------------------------------------------------

5. FINANCIAL INTEGRITY INVARIANTS

5.1 Financial Immutability

- financial_events table is append-only.
- UPDATE is forbidden.
- DELETE is forbidden.
- Corrections MUST use compensating entries.
- Financial events MUST be idempotent.

5.2 Price Locking

- Order price MUST be locked at ACCEPTED state.
- Locked price MUST NEVER change.
- Discounts or adjustments MUST be recorded as separate financial events.
- Historical totals MUST NEVER be recalculated.

5.3 Ledger Consistency

Every financial event MUST include:

- company_id
- reference_id
- event_type
- amount
- currency
- timestamp

Ledger rules:

- Balance calculation MUST be deterministic.
- Reconciliation MUST be possible at any point in time.
- Financial totals MUST be derived from ledger events only.
- Direct mutation of balance fields is forbidden.

5.4 Order–Financial Coupling

- Order MUST NOT reach COMPLETED if debt balance > 0.
- Financial records MUST NOT exist before order reaches RECEIVED.
- Financial closure MUST be explicit and event-driven.
- Order financial state MUST always be consistent with ledger balance.

------------------------------------------------------------

6. ORDER LIFECYCLE INVARIANTS

6.1 State Machine Enforcement

- Order states MUST follow SYSTEM_STATE_MACHINE_MATRIX.md.
- Skipping states is forbidden.
- Illegal transitions MUST raise domain errors.
- Final states (COMPLETED, CANCELLED) are immutable.

6.2 State Change Rule

- Every state change MUST emit an event.
- Direct status mutation is forbidden.
- State transitions MUST be validated at domain layer.
- No implicit transitions allowed.

6.3 Cancellation Cutoff

- Once order enters PREPARING state,
  cancellation by trader is permanently disabled.
- Cancellation is strictly forbidden after RECEIVED.

------------------------------------------------------------

7. API CONTRACT INVARIANTS

- API responses MUST conform strictly to SYSTEM_API_CONTRACT.
- Breaking response structure is forbidden.
- API versioning MUST be respected.
- Idempotency MUST be enforced where defined.
- API MUST NOT mutate state outside defined commands.
- Backward compatibility MUST be preserved unless explicitly versioned.

------------------------------------------------------------

8. AUTHORIZATION INVARIANTS

- RBAC MUST be enforced at:
  - Middleware layer
  - Domain layer
- Permission checks MUST NOT be bypassable.
- Tenant validation MUST occur BEFORE permission evaluation.
- No data may be fetched before tenant validation.
- Super admin privileges MUST be explicitly defined and fully logged.

------------------------------------------------------------

9. DATA INTEGRITY INVARIANTS

- No orphan records allowed.
- Aggregates MUST maintain referential integrity.
- Soft deletes MUST NOT affect:
  - Event history
  - Financial history
- Hard deletes on event or financial tables are strictly forbidden.
- All timestamps MUST be stored in UTC.
- All financial calculations MUST use persisted timestamps.

------------------------------------------------------------

10. MUTATION & CONSISTENCY RULES

The system strictly forbids:

- Direct mutation of derived state.
- Direct mutation of financial totals.
- Cross-aggregate mutation without domain validation.
- Implicit state changes.
- Hidden side effects.

All state changes MUST be explicit, validated, and traceable.

------------------------------------------------------------

11. OBSERVABILITY & AUDIT INVARIANTS

- Every critical domain action MUST be traceable.
- Financial operations MUST be auditable.
- Event history MUST allow full reconstruction.
- Silent failures are forbidden.
- All domain errors MUST be explicit and structured.

------------------------------------------------------------

12. AGENT EXECUTION RULES

Any AI Agent building or modifying the system:

MUST:

- Follow SYSTEM_DATA_MODEL.md
- Follow SYSTEM_EVENT_MODEL.md
- Follow SYSTEM_FINANCIAL_MODEL.md
- Follow SYSTEM_API_CONTRACT.md
- Validate against SYSTEM_STATE_MACHINE_MATRIX.md
- Respect aggregate boundaries
- Preserve immutability rules

MUST NOT:

- Invent new states
- Modify immutable records
- Remove tenant isolation
- Introduce undocumented behavior
- Skip domain validation
- Bypass event emission

If ambiguity exists:
→ The agent MUST request clarification.

------------------------------------------------------------

13. INFRASTRUCTURE & DEPLOYMENT CONSTRAINTS

- No production deployment without migration integrity.
- Schema changes MUST preserve invariants.
- Backups MUST preserve event and financial history.
- Scaling MUST NOT break tenant isolation.
- Replay or rebuild operations MUST preserve deterministic results.

------------------------------------------------------------

14. ARCHITECTURAL PRECEDENCE RULE

Hierarchy of authority:

1. SYSTEM_INVARIANTS.md
2. SYSTEM_STATE_MACHINE_MATRIX.md
3. SYSTEM_DATA_MODEL.md
4. SYSTEM_EVENT_MODEL.md
5. SYSTEM_FINANCIAL_MODEL.md
6. SYSTEM_API_CONTRACT.md
7. Implementation details

Implementation MUST conform to this hierarchy.

------------------------------------------------------------

FINAL RULE

If implementation contradicts invariants:

The implementation is wrong.
The invariants are correct.
The system must be corrected.
