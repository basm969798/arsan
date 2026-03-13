SYSTEM_API_CONTRACT.md

Arsan — Official API Contract (Architecture-Frozen)

1. PURPOSE

This document defines the authoritative public API contract.

It governs:

Endpoint structure

Versioning

Authentication

Authorization mapping

Tenant isolation

Lifecycle enforcement

Financial immutability

Atomic operations

Idempotency

Error model

Request tracing

Backward compatibility

If conflict exists:

SYSTEM_INVARIANTS.md prevails.

The API is the ONLY public interface.

Direct database access is forbidden.

2. CORE API PRINCIPLES

The Arsan API follows strict design principles.

API-first architecture

Versioned endpoints only

Tenant-aware by default

Command-based state mutation

No hidden side effects

Deterministic state transitions

Financial operations are append-only

Critical operations are idempotent

Cross-aggregate coordination via Process Manager

Queries never mutate state

API endpoints must dispatch commands, not mutate state directly.

3. BASE URL STRUCTURE

All endpoints must be versioned.

Structure:

/api/v1/{resource}

Example:

/api/v1/orders

Breaking changes require version increment:

/api/v2/

Unversioned endpoints are forbidden.

4. AUTHENTICATION

Authentication uses JWT Bearer Token.

Header:

Authorization: Bearer <token>

Token payload must include:

user_id
active_company_id
issued_at
expiration

Security rules:

Token roles must NOT be trusted.

Roles resolved server-side.

Expired token → 401 Unauthorized

Invalid signature → 401 Unauthorized

5. TENANT RESOLUTION

Tenant context derived from:

token.active_company_id

Server must:

Validate tenant context before data access

Scope all queries by company_id

Validate resource ownership

Cross-tenant access must return:

403 Forbidden

Tenant context must propagate through:

API Layer
Command Layer
Domain Layer
Process Manager
6. REQUEST IDENTIFICATION

Each request must generate a unique identifier.

Header returned:

X-Request-ID

Used for:

tracing

audit logs

debugging

Request ID must appear in all logs.

7. STANDARD RESPONSE FORMAT

Success response:

{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}

Error response:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}

Rules:

Stack traces must never be exposed.

Error messages must be deterministic.

8. HTTP STATUS POLICY
Code	Meaning
200	Success
201	Created
202	Accepted (async processing)
204	No Content
400	Validation error
401	Unauthorized
403	Forbidden
404	Not found
409	Invalid state transition
422	Business rule violation
429	Rate limited
500	Internal error
9. COMMAND VS QUERY ENDPOINTS

The API follows CQRS separation.

Command endpoints:

POST

Examples:

POST /orders
POST /orders/{id}/accept
POST /orders/{id}/prepare

Query endpoints:

GET

Examples:

GET /orders/{id}
GET /orders
GET /orders/{id}/offers

Rules:

Queries must:

read projections only

never emit events

never mutate state

10. ORDERS API
10.1 Create Order
POST /api/v1/orders

Permission:

orders.create

Order type determines initial state:

DIRECT → WAITING_FOR_SUPPLIER
PUBLIC → NEW
10.2 Accept Order (Supplier)
POST /api/v1/orders/{orderId}/accept

Permission:

orders.accept

Allowed only when:

status = WAITING_FOR_SUPPLIER

Effect:

Emit event:

ORDER_ACCEPTED
10.3 Submit Offer
POST /api/v1/orders/{orderId}/offers

Permission:

orders.offer.submit

Allowed only when:

status = NEW

Effect:

Emit event:

OFFER_SUBMITTED
10.4 Select Offer
POST /api/v1/orders/{orderId}/offers/{offerId}/select

Permission:

orders.offer.select

Effect:

OFFER_SELECTED

Server must:

lock price

assign supplier_company_id

10.5 Move to Preparing
POST /api/v1/orders/{orderId}/prepare

Permission:

orders.prepare

Allowed when:

status = ACCEPTED

Emit:

ORDER_PREPARING
10.6 Ready for Pickup
POST /api/v1/orders/{orderId}/ready

Permission:

orders.ready

Allowed when:

status = PREPARING

Emit:

ORDER_READY
10.7 Pickup (Atomic Operation)
POST /api/v1/orders/{orderId}/pickup

Permission:

orders.pickup

Required header:

Idempotency-Key

Server must atomically:

Validate QR

Insert order_pickup

Emit ORDER_RECEIVED

Commit transaction

After ORDER_RECEIVED:

Cancellation permanently disabled

Financial phase enabled

10.8 Cancel Order
POST /api/v1/orders/{orderId}/cancel

Permission:

orders.cancel

Allowed states:

NEW
WAITING_FOR_SUPPLIER
ACCEPTED (before PREPARING)

Forbidden after:

PREPARING

Emit:

ORDER_CANCELLED
11. FINANCIAL API

Financial operations are append-only.

11.1 Register Cash
POST /api/v1/orders/{orderId}/financial/cash

Permission:

financial.register_cash

Required:

Idempotency-Key

Allowed only after:

ORDER_RECEIVED

Effects:

FINANCIAL_CASH_REGISTERED
FINANCIAL_BALANCE_ZERO

Process Manager emits:

ORDER_COMPLETED

Response:

202 Accepted
11.2 Register Debt
POST /api/v1/orders/{orderId}/financial/debt

Permission:

financial.register_debt

Required:

Idempotency-Key

Emit:

FINANCIAL_DEBT_REGISTERED
11.3 Register Payment
POST /api/v1/orders/{orderId}/financial/payments

Permission:

financial.register_payment

Rules:

amount > 0
amount ≤ outstanding balance

Emit:

FINANCIAL_PAYMENT_REGISTERED

If outstanding becomes zero:

FINANCIAL_BALANCE_ZERO
→ Process Manager emits ORDER_COMPLETED
12. OWNERSHIP TRANSFER API
12.1 Request Transfer
POST /api/v1/orders/{orderId}/transfer

Permission:

ownership.transfer.request

Emit:

OWNERSHIP_TRANSFER_REQUESTED
12.2 Accept Transfer
POST /api/v1/orders/{orderId}/transfer/accept

Permission:

ownership.transfer.accept

Required:

Idempotency-Key

Atomic operation:

Emit OWNERSHIP_TRANSFER_ACCEPTED

Emit FINANCIAL_TRANSFER_REGISTERED

Process Manager updates projection.

Response:

202 Accepted
13. IDEMPOTENCY POLICY

Idempotency required for:

pickup
cash registration
debt registration
payment
transfer acceptance

Rules:

Client sends:

Idempotency-Key

Server stores key:

UNIQUE(aggregate_id, idempotency_key)

Duplicate requests must:

return identical response

NOT emit duplicate events

14. STATE TRANSITION PROTECTION

Server must enforce:

lifecycle matrix

no skipped states

no mutation after final state

no financial before RECEIVED

Invalid transition → 409 Conflict.

15. FINANCIAL IMMUTABILITY

The API must never allow:

UPDATE financial_events
DELETE financial_events
MODIFY historical ledger

Financial operations are POST-only append operations.

16. PAGINATION & FILTERING

List endpoints must support:

limit
cursor
sort

Offset pagination is discouraged.

Cursor-based pagination preferred for scalability.

17. RATE LIMITING

API rate limits must protect system stability.

Default limits:

Authenticated: 100 requests / minute
Burst protection enabled

Exceeded limit → 429 Too Many Requests.

18. LOGGING & TRACEABILITY

Every request must log:

requestId
userId
companyId
endpoint
statusCode
timestamp

Logs must be structured and searchable.

19. BACKWARD COMPATIBILITY

Version stability rules:

/v1 is stable

Breaking change requires /v2

Removing fields forbidden within same version

Additive fields allowed

FINAL API GUARANTEE

This API guarantees:

Strict tenant isolation

Deterministic lifecycle enforcement

Financial immutability

Atomic pickup execution

Idempotent financial commands

Process Manager coordination

Replay-safe architecture

Production-grade API stability

Any API behavior violating system invariants is considered a critical system failure
