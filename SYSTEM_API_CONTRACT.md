# Arsan — Official API Contract (Architecture-Frozen)

------------------------------------------------------------

1. PURPOSE

This document defines the authoritative public API contract.

It governs:

- Endpoint structure
- Versioning
- Authentication
- Authorization mapping
- Tenant isolation
- Lifecycle enforcement
- Financial immutability
- Atomic operations
- Idempotency
- Error model
- Backward compatibility

If conflict exists:
SYSTEM_INVARIANTS.md prevails.

The API is the ONLY public interface.
Direct database access is forbidden.

------------------------------------------------------------

2. CORE API PRINCIPLES

1. API-first architecture
2. Versioned endpoints only
3. Tenant-aware by default
4. No hidden side effects
5. Deterministic transitions
6. Financial operations are append-only
7. Critical endpoints are idempotent
8. No endpoint directly mutates derived state
9. Cross-aggregate effects handled via Process Manager

------------------------------------------------------------

3. BASE URL STRUCTURE

/api/v1/{resource}

Breaking change:
→ /api/v2/{resource}

Unversioned endpoints are forbidden.

------------------------------------------------------------

4. AUTHENTICATION

Method:
JWT Bearer Token

Header:
Authorization: Bearer <token>

Token MUST include:

- user_id
- active_company_id
- issued_at
- expiration

Roles MUST NOT be trusted from token.
Roles resolved server-side.

Invalid or expired token → 401 Unauthorized

------------------------------------------------------------

5. TENANT RESOLUTION

currentTenant = token.active_company_id

Server MUST:

- Validate tenant context BEFORE data fetch
- Scope all queries by company_id
- Validate resource ownership

Cross-tenant access → 403 Forbidden

------------------------------------------------------------

6. STANDARD RESPONSE FORMAT

Success:

{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}

Error:

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

Stack traces MUST NEVER be exposed.

------------------------------------------------------------

7. HTTP STATUS POLICY

200 → Success  
201 → Created  
202 → Accepted (async processing)  
204 → No Content  
400 → Validation Error  
401 → Unauthorized  
403 → Forbidden  
404 → Not Found  
409 → Invalid State Transition  
422 → Business Rule Violation  
429 → Rate Limited  
500 → Internal Error  

------------------------------------------------------------

8. ORDERS API

------------------------------------------------------------
8.1 Create Order

POST /api/v1/orders
Permission: orders.create

Initial status:
DIRECT → WAITING_FOR_SUPPLIER
PUBLIC → NEW

------------------------------------------------------------
8.2 Accept Order (Supplier Only)

POST /api/v1/orders/{orderId}/accept
Permission: orders.accept

Allowed only:
status = WAITING_FOR_SUPPLIER

Effect:
Emit ORDER_ACCEPTED

------------------------------------------------------------
8.3 Submit Offer (Public Only)

POST /api/v1/orders/{orderId}/offers
Permission: orders.offer.submit

Allowed only:
status = NEW

------------------------------------------------------------
8.4 Select Offer

POST /api/v1/orders/{orderId}/offers/{offerId}/select
Permission: orders.offer.select

Effect:
Emit OFFER_SELECTED
Lock price
Set supplier_company_id

------------------------------------------------------------
8.5 Move to Preparing

POST /api/v1/orders/{orderId}/prepare
Permission: orders.prepare

Allowed only:
status = ACCEPTED

Emit ORDER_PREPARING

------------------------------------------------------------
8.6 Ready for Pickup

POST /api/v1/orders/{orderId}/ready
Permission: orders.ready

Allowed only:
status = PREPARING

Emit ORDER_READY

------------------------------------------------------------
8.7 Pickup (Atomic)

POST /api/v1/orders/{orderId}/pickup
Permission: orders.pickup
Header: Idempotency-Key

Server must atomically:

- Validate QR
- Insert order_pickup
- Emit ORDER_RECEIVED
- Commit transaction

Returns:
200 Success

After ORDER_RECEIVED:
- Cancellation forbidden
- Financial phase enabled

------------------------------------------------------------
8.8 Cancel Order

POST /api/v1/orders/{orderId}/cancel
Permission: orders.cancel

Allowed only when:

- NEW
- WAITING_FOR_SUPPLIER
- ACCEPTED (before PREPARING)

Forbidden after PREPARING.

Emit ORDER_CANCELLED

------------------------------------------------------------

9. FINANCIAL API

------------------------------------------------------------
9.1 Register Cash

POST /api/v1/orders/{orderId}/financial/cash
Permission: financial.register_cash
Header: Idempotency-Key

Allowed only after:
ORDER_RECEIVED

Effect:
Emit FINANCIAL_CASH_REGISTERED
Emit FINANCIAL_BALANCE_ZERO

Process Manager:
→ Emits ORDER_COMPLETED

Response:
202 Accepted

------------------------------------------------------------
9.2 Register Debt

POST /api/v1/orders/{orderId}/financial/debt
Permission: financial.register_debt
Header: Idempotency-Key

Allowed only after:
ORDER_RECEIVED

Emit FINANCIAL_DEBT_REGISTERED

Response:
200 Success

------------------------------------------------------------
9.3 Register Payment

POST /api/v1/orders/{orderId}/financial/payments
Permission: financial.register_payment
Header: Idempotency-Key

Rules:

- amount > 0
- amount ≤ outstanding balance (derived)

Emit FINANCIAL_PAYMENT_REGISTERED

If outstanding = 0:
Emit FINANCIAL_BALANCE_ZERO
Process Manager emits ORDER_COMPLETED

Response:
200 Success
If completion triggered:
202 Accepted

------------------------------------------------------------

10. OWNERSHIP TRANSFER API

------------------------------------------------------------
10.1 Request Transfer

POST /api/v1/orders/{orderId}/transfer
Permission: ownership.transfer.request

Emit OWNERSHIP_TRANSFER_REQUESTED

------------------------------------------------------------
10.2 Accept Transfer

POST /api/v1/orders/{orderId}/transfer/accept
Permission: ownership.transfer.accept
Header: Idempotency-Key

Atomically:

- Emit OWNERSHIP_TRANSFER_ACCEPTED
- Emit FINANCIAL_TRANSFER_REGISTERED

Process Manager updates projection owner_company_id

Response:
202 Accepted

------------------------------------------------------------

11. IDEMPOTENCY POLICY

Required for:

- Pickup
- Cash registration
- Debt registration
- Payment
- Transfer acceptance

Rules:

- Client sends Idempotency-Key
- Server stores key per aggregate
- Duplicate request returns identical response body
- New requestId generated per HTTP call
- No duplicate event emission allowed

------------------------------------------------------------

12. STATE TRANSITION PROTECTION

Server MUST validate:

- No skipping states
- No illegal transitions
- No mutation after final state
- No financial before RECEIVED
- No lifecycle bypass

Invalid transition → 409 Conflict

------------------------------------------------------------

13. FINANCIAL IMMUTABILITY

No API endpoint may:

- Update financial_events
- Delete financial_events
- Modify historical ledger

Financial operations are POST-only.

------------------------------------------------------------

14. LOGGING & TRACEABILITY

Every request must log:

- requestId
- userId
- companyId
- endpoint
- statusCode
- timestamp

Structured logging mandatory.

------------------------------------------------------------

15. BACKWARD COMPATIBILITY

- v1 is stable
- Breaking changes require v2
- Field removal forbidden within same version
- Additive changes allowed

------------------------------------------------------------

FINAL API GUARANTEE

This API guarantees:

- Strict tenant isolation
- Lifecycle integrity
- Financial immutability
- Atomic pickup
- Deterministic transitions
- Idempotent financial commands
- Process Manager consistency
- Production-grade safety

Violations are critical system failures.
