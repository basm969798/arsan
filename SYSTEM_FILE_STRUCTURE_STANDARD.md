# SYSTEM_FILE_STRUCTURE_STANDARD.md

Authoritative Code File Structure & Isolation Rules

------------------------------------------------------------

1. PURPOSE

This document defines the mandatory file structure rules
for the Arsan backend codebase.

It governs:

- File naming
- File responsibilities
- Folder boundaries
- Dependency direction
- Layer isolation
- Import restrictions
- File size discipline
- Anti-chaos enforcement

These rules are mandatory for:

- Human developers
- AI agents
- Code reviews

If violated:
The implementation must be corrected.

------------------------------------------------------------

2. GENERAL FILE PRINCIPLES

2.1 Single Responsibility Rule

Each file MUST contain:

- One primary class
OR
- One interface
OR
- One enum
OR
- One value object

Multiple unrelated constructs in one file are forbidden.

------------------------------------------------------------

2.2 Naming Convention

File names must reflect exact purpose.

Allowed examples:

create-order.command.ts
create-order.handler.ts
order.aggregate.ts
order.repository.interface.ts
order.entity.ts
order-status.enum.ts
subscription.service.ts
plan.entity.ts

Forbidden names:

utils.ts
helpers.ts
common.ts
misc.ts
service.ts (without context)
manager.ts (generic)
controller.ts (generic)

File names must be explicit and role-driven.

------------------------------------------------------------

3. LAYER ISOLATION RULES

Arsan follows strict layered architecture:

API Layer
Application Layer
Domain Layer
Infrastructure Layer
Shared Kernel

------------------------------------------------------------

3.1 Domain Layer Rules

Location:
src/**/domain/

Domain files MUST NOT import:

- ORM libraries
- Database clients
- HTTP libraries
- Framework decorators
- Redis
- External APIs

Domain layer must be pure business logic.

------------------------------------------------------------

3.2 Application Layer Rules

Location:
src/**/application/

May import:

- Domain
- Repository interfaces

Must NOT import:

- Database implementation
- Infrastructure directly

Handlers must coordinate logic,
not implement business invariants.

------------------------------------------------------------

3.3 Infrastructure Layer Rules

Location:
src/**/infrastructure/

May import:

- Domain
- Repository interfaces

Must NOT:

- Contain business rules
- Contain state machine validation
- Contain price locking logic

Infrastructure is purely technical.

------------------------------------------------------------

3.4 API Layer Rules

Location:
src/**/api/

Responsibilities:

- Receive HTTP request
- Validate DTO
- Call application handler
- Return response

Must NOT:

- Contain business logic
- Contain state transitions
- Modify domain state directly

------------------------------------------------------------

4. MODULE BOUNDARY RULES

Each bounded context must be isolated.

Example:

src/saas/identity/
src/saas/subscription/
src/business/order/
src/business/financial/
src/business/ownership/

Modules must not directly import
internal files of other modules.

Allowed:

Importing public interfaces only.

Forbidden:

Deep imports across modules.

------------------------------------------------------------

5. IMPORT DISCIPLINE

Rules:

- No circular dependencies
- No cross-layer reverse imports
- No domain → infrastructure import
- No business → saas bypass
- No direct financial mutation

Imports must follow:

API → Application → Domain
Infrastructure implements interfaces

------------------------------------------------------------

6. FILE SIZE DISCIPLINE

Soft limits:

- 300 lines maximum per file
- 500 lines absolute maximum

If exceeded:
File must be split.

Large God-classes are forbidden.

------------------------------------------------------------

7. ENUM & VALUE OBJECT RULE

Enums must live in dedicated files:

order-status.enum.ts
subscription-status.enum.ts

Value objects must be immutable.

------------------------------------------------------------

8. ERROR HANDLING STRUCTURE

Custom errors must:

- Live in domain or shared
- Be specific
- Not be generic “Error”

Example:

InvalidStateTransitionError
SubscriptionExpiredError
TenantAccessDeniedError

------------------------------------------------------------

9. SHARED KERNEL RULES

Location:
src/shared/

Contains only:

- Base classes
- Generic utilities (pure)
- Value objects
- Domain errors

Must NOT contain:

- Business-specific logic
- Subscription rules
- Order rules

------------------------------------------------------------

10. FORBIDDEN PATTERNS

The following are strictly forbidden:

- God services
- Mega controllers
- Cross-domain mutation
- Direct DB usage in domain
- Business logic in controller
- Financial calculations outside financial domain
- Bypassing subscription validation

------------------------------------------------------------

11. TEST STRUCTURE RULE

Tests must mirror structure:

order.aggregate.spec.ts
subscription.service.spec.ts

Tests must not depend on infrastructure.

------------------------------------------------------------

12. AI AGENT RULE

AI agent must:

- Create smallest valid files
- Follow naming rules
- Follow layer isolation
- Avoid creating large monolithic files
- Avoid speculative dependencies

If unclear:
Agent must request clarification.

------------------------------------------------------------

FINAL FILE STRUCTURE GUARANTEE

Arsan enforces:

- Clean separation of concerns
- Strict layer boundaries
- Deterministic dependencies
- Modular isolation
- File-level discipline

No file may violate these rules.

If it does:
It must be refactored immediately.
