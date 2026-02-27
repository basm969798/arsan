# Arsan — Official Financial Model (Final)

## 1. Purpose

This document defines the authoritative Financial Model for Arsan.

It governs:

- Price locking rules
- Financial lifecycle
- Debt handling
- Partial payments
- Ownership financial transfers
- Financial immutability
- Event-based financial integrity
- Multi-tenant isolation for financial data

Financial data is critical and immutable.
Any violation is considered a critical system failure.

---

## 2. Core Financial Principles

1. Financial records are immutable.
2. Financial records are append-only.
3. No financial UPDATE operations allowed.
4. No financial DELETE operations allowed.
5. All financial state must be derived from events.
6. Price must be locked before financial phase.
7. Debt must close only when balance reaches zero.
8. Financial actions must be atomic.
9. All financial records are tenant-scoped.

---

## 3. Price Locking Model

Price locking occurs when:

- Supplier accepts a DIRECT order
OR
- Trader selects an offer in PUBLIC order

At this moment:

- orders.locked_price is set
- order_items.price_snapshot is frozen
- Price becomes immutable

After locking:

- Supplier inventory price changes do NOT affect order
- No recalculation allowed
- No discount mutation allowed

---

## 4. Financial Lifecycle

Financial phase begins ONLY after:

ORDER_RECEIVED event.

Flow:

1. Pickup completed
2. Order status → RECEIVED
3. Financial closing required
4. Trader chooses:
   - CASH
   - DEBT

Order cannot reach COMPLETED without financial resolution.

---

## 5. Financial Events Storage

Financial records are stored in:

Table: financial_events

Fields:

- id (UUID, PK)
- company_id (UUID)
- order_id (UUID)
- event_type (CASH | DEBT | PAYMENT | TRANSFER)
- amount (numeric)
- balance_after (numeric)
- created_at (timestamp)
- metadata (JSONB)

Rules:

- Append-only
- No update
- No delete
- Deterministic balance_after

Indexes:

- INDEX(company_id)
- INDEX(order_id)

---

## 6. Cash Closing

When method = CASH:

- One financial event created:
  FINANCIAL_CASH_REGISTERED
- balance_after = 0
- Order status → COMPLETED

No further financial events allowed.

---

## 7. Debt Model

When method = DEBT:

- One financial event created:
  FINANCIAL_DEBT_REGISTERED
- balance_after = locked_price

Order remains open.

Debt remains active until balance_after = 0.

---

## 8. Partial Payments

Each payment:

- Creates FINANCIAL_PAYMENT_REGISTERED event
- Decreases balance
- Must not exceed outstanding balance

Rules:

- balance_after >= 0
- Overpayment forbidden
- If balance_after = 0 → ORDER_COMPLETED event emitted

Each payment is independent and immutable.

---

## 9. Financial Completion Rules

Order becomes COMPLETED only when:

- CASH payment recorded
OR
- Debt fully settled

After COMPLETED:

- No further financial events allowed
- No cancellation allowed
- No ownership transfer allowed

Final state is immutable.

---

## 10. Ownership Transfer Financial Impact

Ownership transfer requires:

1. OWNERSHIP_TRANSFER_ACCEPTED event
2. FINANCIAL_TRANSFER_REGISTERED event
3. Update order.owner_company_id

Transfer must:

- Execute atomically
- Preserve financial integrity
- Not modify historical financial events

Transfer event records financial movement between companies.

---

## 11. Multi-Tenant Financial Isolation

Every financial_event must include:

company_id

Rules:

- No cross-tenant financial visibility
- Queries must filter by company_id
- No shared financial aggregates across tenants

Isolation is mandatory.

---

## 12. Concurrency & Atomicity

Financial operations must:

- Execute inside database transactions
- Use optimistic locking on orders
- Prevent double processing via idempotency keys

Critical operations requiring idempotency:

- Pickup
- Financial closing
- Payment
- Ownership transfer acceptance

Duplicate financial events are forbidden.

---

## 13. Derived Financial State

Financial balance must be computed from:

financial_events ordered by created_at or version.

Balance must never rely on mutable columns.

Rebuilding balance from events must always produce identical result.

---

## 14. Audit & Compliance Guarantees

The financial model guarantees:

- Complete historical traceability
- Deterministic balance computation
- Immutable transaction history
- Tenant-isolated financial ledgers
- No retroactive mutation
- Atomic financial operations

Financial events are permanent audit records.

---

## 15. Forbidden Financial Actions

The system must never allow:

- Updating financial_events
- Deleting financial_events
- Rewriting historical balances
- Negative balances
- Overpayment
- Skipping financial closing
- Completing order before pickup

Any of these is a critical violation.

---

## Final Financial Guarantee

The Financial Model guarantees:

- Strict price locking
- Immutable ledger
- Deterministic balance tracking
- Proper debt lifecycle
- Safe partial payments
- Secure ownership transfers
- Full auditability
- Multi-tenant financial isolation

Financial integrity is non-negotiable.
