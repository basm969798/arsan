SYSTEM_FILE_STRUCTURE_STANDARD.md

Authoritative Code File Structure & Isolation Rules

1. PURPOSE

This document defines the mandatory file structure rules for the Arsan backend codebase.

It governs:

File naming

File responsibilities

Folder boundaries

Dependency direction

Layer isolation

Import restrictions

File size discipline

Module boundaries

Event and command organization

Anti-chaos enforcement

These rules are mandatory for:

Human developers

AI agents

Code reviews

If violated:

The implementation must be corrected.

If conflict exists:

SYSTEM_INVARIANTS.md prevails.

2. GENERAL FILE PRINCIPLES
2.1 Single Responsibility Rule

Each file MUST contain:

One primary class
OR

One interface
OR

One enum
OR

One value object

Multiple unrelated constructs in a single file are forbidden.

2.2 Naming Convention

File names must reflect their exact responsibility.

Allowed examples:

create-order.command.ts
create-order.handler.ts
order.aggregate.ts
order.repository.interface.ts
order.repository.ts
order.entity.ts
order-status.enum.ts
financial-payment.command.ts
financial-payment.handler.ts

Forbidden names:

utils.ts
helpers.ts
common.ts
misc.ts
service.ts
manager.ts
controller.ts

Generic names without context are forbidden.

3. LAYER ISOLATION RULES

Arsan follows strict layering.

API Layer
Application Layer
Domain Layer
Infrastructure Layer
Shared Kernel

Dependencies must flow inward only.

4. DOMAIN LAYER RULES

Location:

src/**/domain/

Domain files may contain:

Aggregates

Value objects

Domain events

Domain services

Domain errors

Enums

Domain files MUST NOT import:

ORM libraries
Database clients
HTTP frameworks
NestJS decorators
Redis
External APIs
Logging frameworks
Infrastructure code

Domain must be framework independent.

5. APPLICATION LAYER RULES

Location:

src/**/application/

Contains:

commands/
handlers/
queries/
query-handlers/
sagas/

Responsibilities:

Command orchestration

Aggregate loading

Transaction coordination

Event dispatching

Application layer MAY import:

Domain
Repository interfaces
Shared kernel

Application layer MUST NOT import:

Database implementations
Infrastructure adapters
ORM entities
6. COMMAND FILE STRUCTURE

Commands must follow naming discipline.

Example:

create-order.command.ts
create-order.handler.ts
create-order.dto.ts

Command files must contain:

Command definition
Input DTO
Handler logic

Command handler responsibilities:

Load aggregate
Execute domain method
Persist events
Commit transaction

Command handlers must not implement business rules.

7. QUERY FILE STRUCTURE

Queries are read-only.

Example:

get-order.query.ts
get-order.handler.ts
list-orders.query.ts
list-orders.handler.ts

Query handlers may access:

Projection tables
Read models
Indexes

Query handlers MUST NOT:

Emit events
Mutate domain state
Call domain aggregates
8. DOMAIN EVENT FILES

Domain events must be defined explicitly.

Example:

order-accepted.event.ts
order-preparing.event.ts
order-ready.event.ts
order-received.event.ts
financial-payment-registered.event.ts

Events must contain:

aggregateId
eventType
version
timestamp
payload

Events must be immutable.

9. INFRASTRUCTURE LAYER RULES

Location:

src/**/infrastructure/

Contains:

repositories/
event-store/
db/
messaging/
external-services/
cache/

Infrastructure may import:

Domain
Repository interfaces
Shared kernel

Infrastructure must NOT:

Implement domain rules
Implement lifecycle transitions
Contain price locking logic

Infrastructure implements technical adapters only.

10. REPOSITORY STRUCTURE

Repository interfaces must exist in domain.

Example:

order.repository.interface.ts

Infrastructure implements them:

order.repository.ts

Repositories must support:

loadAggregate()
appendEvents()
saveVersion()

Repositories must enforce optimistic concurrency.

11. PROJECTION STRUCTURE

Projection handlers must exist separately.

Location:

src/**/projections/

Example:

order-status.projection.ts
financial-balance.projection.ts
ownership.projection.ts

Projection handlers must:

listen to events
update projection tables
remain idempotent

Projection handlers must never emit new events.

12. PROCESS MANAGER / SAGA STRUCTURE

Location:

src/**/application/sagas/

Example:

order-financial-completion.saga.ts
ownership-transfer.saga.ts

Saga responsibilities:

listen to events
dispatch commands
coordinate cross-domain flows

Saga must NOT mutate aggregates directly.

13. MODULE BOUNDARY RULES

Bounded contexts must be isolated.

Example modules:

src/saas/identity/
src/saas/subscription/

src/business/order/
src/business/financial/
src/business/ownership/
src/business/catalog/

Modules may only import:

Public interfaces
Shared kernel

Deep imports across modules are forbidden.

14. IMPORT DISCIPLINE

Rules:

No circular dependencies
No cross-layer reverse imports
No domain → infrastructure imports
No business → saas bypass

Dependency direction must follow:

API → Application → Domain
Infrastructure implements interfaces
15. FILE SIZE DISCIPLINE

Soft limit:

300 lines

Hard limit:

500 lines

If exceeded:

File must be split.

Large God classes are forbidden.

16. ENUM & VALUE OBJECT RULE

Enums must live in dedicated files.

Example:

order-status.enum.ts
financial-event-type.enum.ts

Value objects must be:

immutable
validated on creation
side-effect free
17. ERROR HANDLING STRUCTURE

Domain errors must live in domain or shared.

Examples:

InvalidStateTransitionError
TenantAccessDeniedError
FinancialBalanceViolationError
OfferSelectionConflictError

Generic Error usage is forbidden.

18. SHARED KERNEL RULES

Location:

src/shared/

Contains only:

Base classes
Generic utilities
Common value objects
Domain error base classes

Shared kernel must NOT contain:

Order logic
Financial logic
Subscription rules
Tenant business rules
19. TEST STRUCTURE RULE

Tests must mirror source structure.

Example:

order.aggregate.spec.ts
financial-payment.command.spec.ts
ownership-transfer.saga.spec.ts

Tests must focus on:

Domain rules
Command handlers
State transitions
Financial correctness

Tests must not depend on infrastructure implementations.

20. AI AGENT RULE

AI agents must:

create minimal valid files
respect naming conventions
respect layer isolation
avoid speculative dependencies
avoid creating large monolithic files

If ambiguity exists:

Agent must request clarification.

FINAL FILE STRUCTURE GUARANTEE

Arsan enforces:

strict module boundaries

deterministic dependency flow

event-driven file organization

clean separation of concerns

modular domain isolation

small maintainable files

No file may violate these rules.

If it does:

it must be refactored immediately.
