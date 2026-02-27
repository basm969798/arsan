# SYSTEM_CODE_ARCHITECTURE.md

Authoritative Code Architecture
Hybrid Transactional Model

------------------------------------------------------------

1. PURPOSE

This document defines the official code-layer architecture of Arsan.

It governs:

- Backend layering
- Frontend layering
- Responsibility boundaries
- Dependency rules
- Allowed and forbidden interactions

If code violates this document:
The code must be refactored.

------------------------------------------------------------

========================
BACKEND ARCHITECTURE
========================

2. BACKEND LAYERS OVERVIEW

Arsan backend follows a strict layered architecture:

1. API Layer
2. Application Layer
3. Domain Layer
4. Infrastructure Layer
5. Persistence (DB Models)

Each layer has strict responsibilities.

------------------------------------------------------------

3. API LAYER

Location:
backend/api/

Responsibilities:

- Receive HTTP requests
- Validate DTOs
- Authenticate user
- Resolve tenant context
- Check permissions
- Call Application Use Case
- Return standardized response

Forbidden:

- Business logic
- State transitions
- Direct database queries
- Domain rule validation
- Financial calculations

Controllers must be thin.

------------------------------------------------------------

4. APPLICATION LAYER (USE CASES)

Location:
backend/application/

Responsibilities:

- Execute Commands (Use Cases)
- Load aggregates from repository
- Call Domain methods
- Persist changes
- Append audit events
- Handle transactions

Examples:

- SubmitOrder
- AcceptOrder
- CancelOrder
- ConfirmPickup
- CloseWithCash
- RegisterDebt
- RegisterPayment
- TransferOwnership

Forbidden:

- Direct SQL outside repositories
- Domain rule implementation
- HTTP awareness
- Hardcoded role checks

Application layer orchestrates only.

------------------------------------------------------------

5. DOMAIN LAYER (CORE)

Location:
backend/domain/

This is the heart of the system.

Responsibilities:

- Aggregate roots
- State machine enforcement
- Invariants
- Price locking
- Prevent illegal transitions
- Throw domain errors

Example:

order.transitionTo(READY)

If invalid:
→ Throw DomainException

Forbidden:

- Database access
- Framework imports (NestJS)
- HTTP logic
- External API calls
- Logging side effects

Domain must be framework-independent.

------------------------------------------------------------

6. INFRASTRUCTURE LAYER

Location:
backend/infrastructure/

Responsibilities:

- Database connection
- ORM / Query Builder
- Repositories implementation
- Redis client
- External APIs (VIN, QR validation)
- Logging implementation
- Optimistic locking enforcement

Forbidden:

- Business rules
- Lifecycle decisions
- Authorization decisions

Infrastructure only implements technical details.

------------------------------------------------------------

7. PERSISTENCE MODEL

Database is transactional.

Authoritative state stored in:

- orders.status
- orders.version
- orders.locked_price
- owner_company_id

Append-only tables:

- financial_events
- system_events
- ownership_transfers

State is NOT rebuilt from events.

------------------------------------------------------------

8. DEPENDENCY RULES (BACKEND)

Allowed:

API → Application
Application → Domain
Application → Infrastructure
Infrastructure → Database

Domain must NOT depend on:
- Application
- API
- Infrastructure

No circular dependencies allowed.

------------------------------------------------------------

9. FOLDER STRUCTURE (BACKEND)

backend/
 ├── api/
 ├── application/
 │     ├── commands/
 │     ├── handlers/
 ├── domain/
 │     ├── order/
 │     ├── financial/
 │     ├── ownership/
 │     ├── catalog/
 ├── infrastructure/
 │     ├── db/
 │     ├── repositories/
 │     ├── services/
 └── shared/

------------------------------------------------------------

========================
FRONTEND ARCHITECTURE
========================

10. FRONTEND OVERVIEW

Frontend is server-authoritative.

UI reflects backend state.
UI does NOT decide lifecycle.

Layers:

1. Pages Layer
2. Module Layer
3. API Client Layer
4. UI Logic Layer
5. Shared Components Layer

------------------------------------------------------------

11. PAGES LAYER

Location:
frontend/pages/

Responsibilities:

- Route-level composition
- Data fetching
- Render modules

No business logic.

------------------------------------------------------------

12. MODULE LAYER

Location:
frontend/modules/

Each domain has a module:

- order/
- financial/
- ownership/
- catalog/

Responsibilities:

- Feature-level UI
- API calls
- State display
- Conditional rendering

------------------------------------------------------------

13. API CLIENT LAYER

Location:
frontend/shared/api/

Responsibilities:

- Axios / Fetch configuration
- Attach JWT
- Handle errors
- Send commands to backend

No state mutation.

------------------------------------------------------------

14. UI LOGIC RULE

Frontend must:

- Read order.status from backend
- Show buttons conditionally
- Send POST command to change state
- Wait for server response
- Refresh state

Forbidden:

- setOrderStatus(...)
- Local lifecycle simulation
- Skipping server validation

------------------------------------------------------------

15. ROLE-BASED RENDERING

UI shows actions based on:

- User role
- Order state

Example:

Trader:
- Cancel
- Pickup
- Close financial

Supplier:
- Accept
- Prepare
- Mark ready

Admin:
- Audit view
- Override (if allowed)

Frontend does not enforce security.
Backend remains authoritative.

------------------------------------------------------------

16. GLOBAL RULES

- No business logic in controllers
- No lifecycle logic in frontend
- No direct SQL outside repositories
- No mutation of financial ledger
- No cross-aggregate mutation in domain
- No state change without audit log entry

------------------------------------------------------------

FINAL CODE ARCHITECTURE STATEMENT

Arsan uses:

Hybrid Transactional Backend
Strict Domain Layer
Append-only Financial Ledger
Audit Event Log
Server-Authoritative Frontend
Tenant-Scoped Authorization
Optimistic Concurrency

Code must reflect architecture.
Architecture must never be bypassed.
