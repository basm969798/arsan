# Arsan — Official API Contract (Final)

## 1. Purpose

This document defines the authoritative API contract for Arsan.

It governs:

- Endpoint structure
- Versioning
- Authentication
- Authorization
- Multi-tenant enforcement
- Lifecycle integrity
- Financial immutability
- Atomic operations
- Idempotency
- Error standards
- Backward compatibility

The API is the only public interface to the system.
Direct database access is strictly forbidden.

---

## 2. API Principles

1. API-First architecture
2. Versioned endpoints only
3. Tenant-aware by default
4. Deterministic state transitions
5. No hidden side-effects
6. Append-only financial operations
7. Idempotent critical endpoints
8. Backward compatibility guaranteed

---

## 3. Base URL Structure

All endpoints MUST follow:

/api/v1/{resource}

Future breaking changes:

/api/v2/{resource}

Unversioned endpoints are forbidden.

---

## 4. Authentication

Authentication method:
JWT Bearer Token

Header:
Authorization: Bearer <token>

Token payload must contain:
- user_id
- active_company_id
- roles
- issued_at
- expiration

Missing or invalid token → 401 Unauthorized
Expired token → 401 Unauthorized

---

## 5. Multi-Tenant Enforcement

Every request resolves:

currentTenant = token.active_company_id

Server must enforce:
- company_id scoping
- ownership validation
- role-based authorization

Cross-tenant access → 403 Forbidden

---

## 6. Standard Response Format

### Success Response

{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "ISO8601"
  }
}

### Error Response

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

Internal stack traces must NEVER be exposed.

---

## 7. HTTP Status Code Policy

200  → Success  
201  → Created  
204  → No Content  
400  → Validation Error  
401  → Unauthorized  
403  → Forbidden  
404  → Not Found  
409  → Invalid State Transition  
422  → Business Rule Violation  
429  → Rate Limited  
500  → Internal Error  

---

## 8. Orders API

### Create Order

POST /api/v1/orders

Body:

{
  "orderType": "DIRECT | PUBLIC",
  "supplierCompanyId": "uuid (required if DIRECT)",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10
    }
  ]
}

Initial status:
DIRECT → WAITING_FOR_SUPPLIER  
PUBLIC → NEW  

---

### Accept Order (Supplier Only)

POST /api/v1/orders/{orderId}/accept

Rules:
- Only supplier
- Only when status = WAITING_FOR_SUPPLIER
- Locks price
- Moves to ACCEPTED

Invalid state → 409 Conflict

---

### Submit Offer (Public Orders)

POST /api/v1/orders/{orderId}/offers

Allowed only when status = NEW

---

### Select Offer

POST /api/v1/orders/{orderId}/offers/{offerId}/select

Rules:
- Only trader
- Locks price
- Sets supplier_company_id
- Moves to ACCEPTED
- Only one offer allowed

---

### Move to Preparing

POST /api/v1/orders/{orderId}/prepare

Allowed only when status = ACCEPTED  
Moves to PREPARING

---

### Ready for Pickup

POST /api/v1/orders/{orderId}/ready

Allowed only when status = PREPARING  
Moves to READY_FOR_PICKUP

---

### Pickup (Atomic Operation)

POST /api/v1/orders/{orderId}/pickup

Header:
Idempotency-Key: unique-key

Body:
{
  "qrCode": "string"
}

Server must:
- Verify QR
- Insert order_pickup
- Change state to RECEIVED
- Commit transaction atomically

After RECEIVED:
- Cancellation forbidden
- Financial closing enabled

---

### Financial Closing

POST /api/v1/orders/{orderId}/close

Header:
Idempotency-Key: unique-key

Body:
{
  "method": "CASH | DEBT"
}

Rules:
- Only after RECEIVED
- Creates financial event
- If CASH → status → COMPLETED
- If DEBT → remains open until balance = 0

---

### Register Payment (Debt Only)

POST /api/v1/orders/{orderId}/payments

Header:
Idempotency-Key: unique-key

Body:
{
  "amount": 100
}

Rules:
- Append-only financial event
- If balance_after = 0 → status → COMPLETED

---

### Cancel Order

POST /api/v1/orders/{orderId}/cancel

Allowed:
- Before ACCEPTED
- After ACCEPTED but before RECEIVED

Forbidden:
- After RECEIVED

---

## 9. Ownership Transfer API

### Request Transfer

POST /api/v1/orders/{orderId}/transfer

Creates transfer request.

---

### Accept Transfer

POST /api/v1/orders/{orderId}/transfer/accept

Header:
Idempotency-Key: unique-key

Must:
- Update owner_company_id
- Create TRANSFER financial event
- Log system event
- Execute atomically

---

## 10. Idempotency Policy

Required for:
- Pickup
- Financial closing
- Payment
- Transfer acceptance

Client sends:
Idempotency-Key: UUID

Server must:
- Store key
- Reject duplicate processing
- Return identical response for repeated request

---

## 11. Rate Limiting

Default:
100 requests / minute / IP

Exceeded → 429 Too Many Requests

---

## 12. Pagination Standard

Query:
?page=1&limit=20

Response:

{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}

---

## 13. State Transition Protection

Server must validate:
- No skipping states
- No transition after final state
- No illegal lifecycle changes

Invalid transition → 409 Conflict

---

## 14. Financial Immutability

No API endpoint may:
- Update financial_events
- Delete financial_events

Only POST allowed.

Violations are critical system errors.

---

## 15. Logging & Traceability

Every request must log:
- requestId
- userId
- companyId
- endpoint
- statusCode
- timestamp

Structured logging mandatory.

---

## 16. Backward Compatibility

- v1 remains stable
- Breaking change → v2
- Additive changes allowed
- Field removal forbidden in same version

---

## Final API Guarantee

The API guarantees:

- Strict tenant isolation
- Lifecycle integrity
- Financial immutability
- Atomic pickup
- Deterministic state transitions
- Idempotent financial operations
- Production-grade security

Any violation is considered a critical system failure.
