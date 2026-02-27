# SYSTEM_EXECUTION_CONTRACT.md
Authoritative Execution Model (Architecture-Frozen)

------------------------------------------------------------

1. PURPOSE

This document defines HOW Arsan must be implemented.

It enforces:

- Architectural discipline
- Controlled AI usage
- Deterministic execution
- Safe transaction boundaries
- Event-driven integrity
- Cost protection

If conflict exists:
SYSTEM_INVARIANTS.md prevails.

------------------------------------------------------------

2. EXECUTION PHILOSOPHY

Principles:

- Small vertical slices only
- Always runnable system
- No early wiring
- No premature optimization
- Architecture before features
- Explicit command boundaries
- No hidden side effects

------------------------------------------------------------

3. DEVELOPMENT ROLES

Developer:

- Executes commands
- Creates files
- Commits frequently
- Maintains structure discipline

AI Agent:

- Proposes next minimal step
- Reviews architectural direction
- Prevents invariant violations

AI MUST NOT:

- Generate full subsystems
- Refactor large structures
- Modify frozen architecture
- Bypass lifecycle rules

------------------------------------------------------------

4. LAYERED EXECUTION MODEL

Strict separation:

1. API Layer
2. Authorization Layer
3. Command Layer
4. Domain (Aggregate) Layer
5. Event Store Layer
6. Process Manager
7. Projection Layer

Rules:

- Controllers MUST NOT contain business logic.
- Domain rules MUST NOT exist in controllers.
- Database access MUST NOT occur in controllers.
- Aggregate mutations occur ONLY in domain layer.

------------------------------------------------------------

5. COMMAND EXECUTION FLOW

Every command MUST follow:

HTTP Request
→ Authentication
→ Tenant Validation
→ Authorization Check
→ Command Validation
→ Load Aggregate
→ Validate Current State
→ Emit Domain Event(s)
→ Append Event(s)
→ Update Aggregate Version
→ Commit Transaction
→ Trigger Process Manager (if applicable)
→ Return Response

Skipping any step is forbidden.

------------------------------------------------------------

6. TRANSACTION BOUNDARIES

Single aggregate mutation must be atomic.

Transaction must include:

- Event append
- Aggregate version increment
- Projection update (if synchronous)
- Idempotency key persistence

Process Manager actions may execute in separate transaction.

------------------------------------------------------------

7. PROCESS MANAGER RULES

Process Manager:

- Listens to events
- Dispatches new commands
- NEVER mutates aggregates directly
- NEVER bypasses authorization logic
- MUST respect lifecycle rules

Process Manager must not create hidden side effects.

------------------------------------------------------------

8. EVENT DISCIPLINE

- All state mutations MUST emit events.
- Direct DB mutation of derived state is forbidden.
- Event emission must be deterministic.
- Event append must succeed or rollback entire transaction.

------------------------------------------------------------

9. SMALL SLICE RULE

Each development slice must:

1. Add minimal structure
2. Avoid premature wiring
3. Avoid full feature logic
4. Keep system bootable

After each slice:

- git add .
- git commit -m "small scaffold"
- git push

Large uncommitted changes forbidden.

------------------------------------------------------------

10. MIGRATION DISCIPLINE

- Schema changes via versioned migrations only.
- No manual DB edits.
- No event history rewrite.
- No financial ledger rewrite.
- Backward-compatible changes preferred.

------------------------------------------------------------

11. COST PROTECTION RULE

Avoid:

- Large AI prompts
- Full-feature generation
- Massive refactors
- Architecture changes without review

Only one small safe step at a time.

------------------------------------------------------------

12. FAILURE POLICY

If after a change:

- Application does not start
- Tests fail
- Migration fails

Stop immediately.
Fix before continuing.

------------------------------------------------------------

FINAL EXECUTION GUARANTEE

This execution contract guarantees:

- Architecture discipline
- Deterministic command flow
- Safe transaction boundaries
- Aggregate isolation
- Event-driven integrity
- Financial safety
- Tenant isolation
- Controlled AI behavior
- Low-cost incremental development

Control the AI.
Protect the architecture.
Build slowly.
Stay deterministic.
