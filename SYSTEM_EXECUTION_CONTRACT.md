SYSTEM_EXECUTION_CONTRACT.md

Authoritative Execution Model (Architecture-Frozen)

1. PURPOSE

This document defines HOW the system executes commands and state mutations.

It guarantees:

Deterministic execution

Strict aggregate isolation

Event-driven consistency

Safe transaction boundaries

Idempotent command processing

Tenant-safe execution

Replay-safe behavior

If any conflict exists:

SYSTEM_INVARIANTS.md prevails.

This document governs runtime execution behavior.

2. EXECUTION PRINCIPLES

The system follows strict execution discipline:

All state changes occur through Commands.

Commands mutate only one aggregate.

All mutations emit Domain Events.

Events are the source of truth.

Database projections are derived state only.

All commands are idempotent.

All execution must respect tenant isolation.

All mutations must respect state machine rules.

Forbidden:

Direct database mutation

Controller business logic

Cross-aggregate mutation

Hidden side effects

Event mutation

Bypassing domain validation

3. COMMAND VS QUERY SEPARATION

The system follows CQRS principles.

Commands:

Mutate system state

Emit domain events

Execute through aggregates

Queries:

Read projections

Never mutate state

Never emit events

Strict rule:

Queries MUST NOT modify system state.
Commands MUST NOT return projection-based decisions.
4. LAYERED EXECUTION MODEL

Execution must follow strict layer boundaries.

Layers:

API Layer

Authentication Layer

Tenant Context Layer

Authorization Layer

Command Handler Layer

Domain Aggregate Layer

Event Store Layer

Process Manager Layer

Projection Layer

Forbidden interactions:

Controller → Database
Controller → Aggregate
Controller → Event Store
Domain → HTTP
Domain → Infrastructure services

Allowed interactions:

Controller → Command Handler
Command Handler → Aggregate
Aggregate → Domain Event
Infrastructure → Event Store
Projection → Database
5. COMMAND STRUCTURE

Every command must follow the standard command envelope.

Example:

{
  commandId: UUID,
  aggregateType: "Order",
  aggregateId: UUID,
  commandType: "ACCEPT_OFFER",
  companyId: UUID,
  actorId: UUID,
  idempotencyKey: string,
  timestamp: ISO8601,
  payload: {}
}

Rules:

commandId must be unique

aggregateId must exist

companyId must be validated

idempotencyKey required for critical commands

6. COMMAND EXECUTION FLOW

Every command must follow this deterministic pipeline.

HTTP Request
→ Authentication
→ Tenant Context Validation
→ Authorization Check
→ Command Schema Validation
→ Idempotency Check
→ Load Aggregate
→ Validate Aggregate Version
→ Validate Lifecycle State
→ Execute Domain Logic
→ Emit Domain Event(s)
→ Append Event(s) to Event Store
→ Update Aggregate Version
→ Commit Transaction
→ Dispatch Events to Process Manager
→ Update Projections
→ Return Response

Skipping any step is forbidden.

7. TENANT CONTEXT PROPAGATION

Tenant identity must be validated before any domain access.

Rules:

Every request must contain:

company_id
actor_id

Execution layers must propagate tenant context.

Database queries MUST include:

WHERE company_id = ?

Failure to enforce tenant context is a critical security violation.

8. AGGREGATE LOADING

Aggregates must be reconstructed from event history.

Aggregate load procedure:

Fetch events by aggregate_id
Order by version
Replay events
Reconstruct aggregate state

Rules:

Aggregates must maintain internal version

Version must match event store version

Out-of-order events forbidden

9. OPTIMISTIC CONCURRENCY CONTROL

All aggregate mutations must enforce optimistic locking.

Validation rule:

ExpectedVersion == CurrentVersion

If mismatch occurs:

ConcurrencyException

Transaction must abort.

This prevents race conditions.

10. IDEMPOTENCY ENFORCEMENT

All critical commands must support idempotency.

Examples:

Accept offer

Pickup order

Register payment

Cash closing

Ownership transfer

Implementation:

Client sends:

Idempotency-Key

Server persists:

command_idempotency

Constraint:

UNIQUE(aggregate_id, idempotency_key)

Duplicate command must return previous result.

Duplicate event emission is forbidden.

11. TRANSACTION BOUNDARIES

All aggregate mutations must occur in one database transaction.

Transaction must include:

Event append

Aggregate version increment

Idempotency persistence

Projection update (if synchronous)

Rollback rule:

If any step fails:

Rollback entire transaction

Partial success is forbidden.

12. EVENT APPEND RULES

Events must be appended to system_events.

Rules:

Version increments sequentially

No skipped versions

No event updates

No event deletions

Append operation must be atomic.

Failure must rollback transaction.

13. PROCESS MANAGER EXECUTION

Process Manager implements Saga pattern.

Responsibilities:

Listen to events

Dispatch new commands

Coordinate cross-aggregate workflows

Process Manager must NOT:

Mutate aggregates directly

Bypass command handlers

Modify event history

Saga state stored in:

saga_instances
14. PROJECTION UPDATE RULES

Projections are derived state.

Rules:

Projection updates must be idempotent

Projection handlers must tolerate replay

Projection rebuild must produce identical results

Projection failures must NOT corrupt event store.

Projection rebuild must be possible from event history.

15. EVENT REPLAY SAFETY

System must support event replay.

Replay rules:

Replay must NOT trigger:

Notifications

External integrations

Payment gateways

Webhooks

Replay environment must be isolated.

Replay must produce deterministic projections.

16. FAILURE POLICY

If any of the following occurs:

Application fails to start

Migration fails

Event append fails

Concurrency mismatch occurs

Execution must stop.

System must remain consistent.

No partial mutation allowed.

17. DEVELOPMENT DISCIPLINE

Development must follow small vertical slices.

Each slice must:

Add minimal functionality

Keep system bootable

Avoid architecture refactors

Avoid multi-module changes

After each slice:

git add .
git commit -m "small safe step"
git push

Large uncommitted changes forbidden.

18. AI EXECUTION RULES

AI Agents must operate under strict control.

AI may:

Propose next small step

Generate minimal scaffolding

Validate architectural rules

AI must NOT:

Generate entire subsystems

Refactor architecture

Modify invariant files

Rewrite domain lifecycle

Modify event types

Ambiguity must trigger clarification request.

FINAL EXECUTION GUARANTEE

This execution contract guarantees:

Deterministic command execution

Strict aggregate isolation

Event-driven consistency

Idempotent command processing

Tenant-safe operations

Concurrency-safe mutations

Replay-safe projections

Financial integrity protection

The system remains:

Deterministic
Auditable
Consistent
Replayable
Financially safe

Any violation of this contract is considered architectural failure.
