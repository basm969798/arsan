0. Purpose & Authority

This document defines the non-negotiable architectural invariants of the system.

These invariants:

Apply to all services, modules, agents, and integrations.

Are mandatory for both human and AI-generated implementations.

Override any conflicting implementation detail.

If any implementation conflicts with this document:

THIS DOCUMENT PREVAILS.

1. System Definitions

For clarity:

Tenant = A company (isolated business boundary).

Aggregate = A domain consistency boundary.

Event = An immutable record describing something that happened.

Financial Event = An immutable ledger entry affecting monetary state.

Derived State = Any state computed from events or validated transitions.

2. Multi-Tenancy Invariants
2.1 Tenant Isolation

Every tenant-owned domain table MUST contain company_id.

All queries MUST be filtered by company_id.

Cross-tenant data access is strictly forbidden.

No shared mutable state between tenants.

Caches MUST be tenant-aware.

2.2 Database Enforcement

company_id MUST be indexed.

Composite indexes MUST include company_id where applicable.

Foreign keys MUST not allow cross-tenant reference.

No domain entity may exist without tenant ownership unless explicitly marked as system-level.

Background jobs MUST enforce tenant context.

3. Event Integrity Invariants
3.1 Event Immutability

All domain events are append-only.

Events MUST NEVER be updated.

Events MUST NEVER be deleted.

Corrections MUST be performed using compensating events.

Event schema versioning MUST be supported.

3.2 Event Ordering & Concurrency

Events MUST maintain strict ordering per aggregate.

A version or sequence number is mandatory.

Optimistic concurrency control MUST prevent race conditions.

No out-of-order state mutation allowed.

3.3 State Derivation

Domain state MUST be derived from:

Events

Or validated state transitions

Direct mutation bypassing event logic is forbidden.

Projections MUST be rebuildable from event history.

4. Financial Integrity Invariants
4.1 Financial Immutability

financial_events table is append-only.

UPDATE is forbidden.

DELETE is forbidden.

Corrections MUST use compensating entries.

Financial events MUST be idempotent.

4.2 Price Locking

Order price MUST be locked upon offer acceptance.

Locked price MUST NEVER change.

Discounts or adjustments MUST be separate financial events.

No recalculation of historical totals is allowed.

4.3 Ledger Consistency

Every financial event MUST include:

company_id

reference_id

event_type

amount

currency

timestamp

The ledger MUST satisfy:

Double-entry consistency (if applicable).

Reconciliation capability at any point in time.

Deterministic balance calculation.

5. Order Lifecycle Invariants
5.1 State Machine Enforcement

Order states MUST follow the defined transition matrix.

Skipping states is forbidden.

Final states are immutable.

Illegal transitions MUST raise errors.

5.2 State Change Rule

Every order state change MUST emit an event.

Direct status mutation is forbidden.

State transitions MUST be validated at domain layer.

No implicit transitions allowed.

6. API Contract Invariants

API responses MUST conform strictly to SYSTEM_API_CONTRACT.

Breaking response structure is forbidden.

Versioning MUST be respected.

Idempotency MUST be enforced where defined.

API MUST NOT mutate state outside defined contracts.

Backward compatibility MUST be preserved unless versioned.

7. Authorization Invariants

RBAC MUST be enforced at:

Middleware layer

Domain layer

Permission checks MUST NOT be bypassable.

Tenant isolation MUST be validated BEFORE permission evaluation.

No data should be fetched before tenant validation.

Super admin privileges MUST be explicitly defined and logged.

8. Data Integrity Invariants

No orphan records allowed.

All aggregates MUST maintain referential integrity.

Soft deletes MUST NOT violate:

Financial history

Event history

Hard deletes on financial or event tables are forbidden.

All timestamps MUST be timezone-safe (UTC).

9. Mutation & Consistency Rules

The system strictly forbids:

Direct mutation of derived state.

Direct mutation of financial totals.

Cross-aggregate mutation without domain validation.

Implicit state changes.

Hidden side effects.

All state changes MUST be explicit and traceable.

10. Observability & Audit Invariants

Every critical domain action MUST be traceable.

Financial operations MUST be auditable.

Event history MUST allow full reconstruction.

No silent failure allowed.

11. Agent Execution Rules

Any AI Agent building or modifying the system:

MUST:

Follow SYSTEM_DATA_MODEL

Follow SYSTEM_EVENT_MODEL

Follow SYSTEM_FINANCIAL_MODEL

Follow SYSTEM_API_CONTRACT

Validate against state transition matrix

MUST NOT:

Invent new states

Modify immutable records

Remove tenant isolation

Introduce undocumented behavior

Skip domain validation

If ambiguity exists:
→ The agent MUST request clarification.

12. Infrastructure & Deployment Constraints

No production deployment without migration integrity.

Schema changes MUST preserve invariants.

Backups MUST preserve event and financial history.

Scaling MUST NOT break tenant isolation.

13. Architectural Precedence Rule

Hierarchy of authority:

SYSTEM_INVARIANTS.md

SYSTEM_DATA_MODEL.md

SYSTEM_EVENT_MODEL.md

SYSTEM_FINANCIAL_MODEL.md

SYSTEM_API_CONTRACT.md

Implementation details

Implementation MUST conform to this hierarchy.

FINAL RULE

If implementation contradicts invariants:

The implementation is wrong.
The invariants are correct.
The system must be corrected.


