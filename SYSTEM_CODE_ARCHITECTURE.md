SYSTEM_CODE_ARCHITECTURE.md

Authoritative Code Architecture

1. PURPOSE

This document defines the official code-layer architecture of Arsan.

It governs:

Backend layering

Frontend layering

Responsibility boundaries

Dependency rules

Code organization

Event-driven execution alignment

If code violates this document:

The code must be refactored.

If conflict exists:

SYSTEM_INVARIANTS.md prevails.

2. ARCHITECTURAL STYLE

Arsan backend uses a hybrid architecture combining:

Domain Driven Design (DDD)

Event-driven architecture

CQRS separation

Transactional consistency per aggregate

The system follows:

Command → Domain → Event → Projection

Domain events are the source of truth.

Database projections exist for query efficiency only.

BACKEND ARCHITECTURE
3. BACKEND LAYERS OVERVIEW

The backend follows strict layering:

API Layer

Application Layer

Domain Layer

Infrastructure Layer

Persistence Layer

Each layer has strict responsibilities.

4. API LAYER

Location:

backend/api/

Responsibilities:

Receive HTTP requests

Validate request DTOs

Authenticate user

Resolve tenant context

Perform initial authorization

Dispatch commands to Application layer

Return standardized API responses

Forbidden:

Business logic

Domain rule validation

Lifecycle decisions

Financial calculations

Direct database queries

Controllers must remain thin.

5. APPLICATION LAYER (COMMAND HANDLERS)

Location:

backend/application/

Responsibilities:

Execute Commands

Load aggregates from repository

Invoke domain methods

Persist domain events

Maintain transaction boundaries

Dispatch events to Process Manager

Trigger projection updates

Examples:

SubmitOrderCommand
AcceptOrderCommand
CancelOrderCommand
PrepareOrderCommand
ConfirmPickupCommand
RegisterCashCommand
RegisterDebtCommand
RegisterPaymentCommand
TransferOwnershipCommand

Forbidden:

Domain rule implementation

Direct SQL queries

HTTP logic

Framework-specific domain logic

Application layer orchestrates execution only.

6. DOMAIN LAYER (CORE)

Location:

backend/domain/

This layer represents the business core.

Responsibilities:

Aggregate roots

Domain invariants

Lifecycle state machine

Price locking rules

Financial constraints

Emitting domain events

Throwing domain errors

Example:

order.acceptOffer()
order.transitionToPreparing()
order.markReady()

If a rule is violated:

throw DomainException

Forbidden:

Database access

HTTP logic

Framework dependencies

External services

Logging side effects

The domain layer must remain framework independent.

7. EVENT MODEL IN CODE

Domain events must be explicit classes.

Example:

OrderAcceptedEvent
OrderPreparingEvent
OrderReadyEvent
OrderReceivedEvent
OrderCompletedEvent
FinancialCashRegisteredEvent
FinancialDebtRegisteredEvent
FinancialPaymentRegisteredEvent

Events must contain:

aggregate_id
aggregate_type
event_type
company_id
actor_id
version
payload
timestamp

Events are stored in:

system_events

Events are append-only.

8. INFRASTRUCTURE LAYER

Location:

backend/infrastructure/

Responsibilities:

Database connection

ORM / Query Builder

Event store implementation

Repository implementations

Redis / caching

External integrations

Logging

Message bus

Saga execution

Forbidden:

Business logic

Lifecycle decisions

Domain rule enforcement

Infrastructure only implements technical capabilities.

9. PERSISTENCE MODEL

The database contains two types of data:

Authoritative Data
system_events
financial_events
ownership_transfers
Projection Data
orders
order_items
offers
order_pickup

Projection data is derived from events.

Projection state must be rebuildable from event history.

Direct mutation of projection state without event is forbidden.

10. AGGREGATE REPOSITORIES

Repositories are defined in domain layer as interfaces.

Example:

OrderRepository
FinancialRepository
OwnershipRepository

Infrastructure provides implementations.

Repositories must support:

loadAggregate()
appendEvents()
saveVersion()

Repositories must enforce optimistic concurrency.

11. DEPENDENCY RULES (BACKEND)

Allowed dependencies:

API → Application
Application → Domain
Application → Infrastructure
Infrastructure → Database

Domain must NOT depend on:

API
Application
Infrastructure
Frameworks

No circular dependencies allowed.

12. FOLDER STRUCTURE (BACKEND)
backend/
 ├── api/
 │     ├── controllers/
 │     ├── dto/
 │
 ├── application/
 │     ├── commands/
 │     ├── handlers/
 │     ├── sagas/
 │
 ├── domain/
 │     ├── order/
 │     ├── financial/
 │     ├── ownership/
 │     ├── catalog/
 │
 ├── infrastructure/
 │     ├── db/
 │     ├── event-store/
 │     ├── repositories/
 │     ├── messaging/
 │     ├── services/
 │
 └── shared/
FRONTEND ARCHITECTURE
13. FRONTEND OVERVIEW

Frontend is server-authoritative.

UI reflects backend state.

Frontend must never simulate lifecycle.

Layers:

Pages Layer

Modules Layer

API Client Layer

UI Logic Layer

Shared Components Layer

14. PAGES LAYER

Location:

frontend/pages/

Responsibilities:

Route composition

Page-level layout

Data fetching

No business logic allowed.

15. MODULE LAYER

Location:

frontend/modules/

Each domain module contains:

orders/
financial/
ownership/
catalog/

Responsibilities:

UI components

Feature-level state

Interaction handling

16. API CLIENT LAYER

Location:

frontend/shared/api/

Responsibilities:

HTTP client configuration

Attach JWT

Handle errors

Dispatch commands

The client must never simulate server logic.

17. UI LIFECYCLE RULE

Frontend must follow:

Read state from backend
Display allowed actions
Send POST command
Wait for server response
Refresh state

Forbidden:

setOrderStatus()
Local lifecycle simulation
Skipping backend validation

Server remains authoritative.

18. ROLE-BASED UI RENDERING

Frontend may conditionally display actions.

Example:

Trader:

Cancel
Pickup
Financial closing

Supplier:

Accept order
Prepare order
Mark ready

Admin:

Audit view
Management actions

Security enforcement always remains backend responsibility.

19. GLOBAL CODE RULES

The system forbids:

Business logic in controllers

Lifecycle simulation in frontend

Direct SQL outside repositories

Event mutation

Financial ledger mutation

Cross-aggregate mutation in domain

State changes without domain events

Violations are architecture failures.

FINAL CODE ARCHITECTURE STATEMENT

Arsan implements:

Domain Driven Design

Event-driven lifecycle

Append-only financial ledger

Deterministic projections

Server-authoritative frontend

Strict tenant isolation

Optimistic concurrency

Process Manager orchestration

Code must reflect architecture.

Architecture must never be bypassed.
