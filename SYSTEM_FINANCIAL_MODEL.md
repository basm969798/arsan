# SYSTEM_FINANCIAL_MODEL.md
Authoritative Financial Model (Architecture-Frozen)

------------------------------------------------------------

1. PURPOSE

This document defines the authoritative Financial Model.

It governs:

- Price locking
- Financial lifecycle
- Debt handling
- Partial payments
- Ownership financial transfers
- Financial immutability
- Ledger derivation rules
- Multi-tenant isolation

If conflict exists:
SYSTEM_INVARIANTS.md prevails.

Financial integrity is non-negotiable.

------------------------------------------------------------

2. CORE FINANCIAL PRINCIPLES

1. Financial records are immutable.
2. Financial records are append-only.
3. UPDATE operations are forbidden.
4. DELETE operations are forbidden.
5. All financial state is derived from ledger events.
6. No derived balance is stored as source of truth.
7. Price must be locked before financial phase.
8. Financial operations must be atomic.
9. All financial records are tenant-scoped.
10. Cross-aggregate mutation is forbidden.

------------------------------------------------------------

3. PRICE LOCKING MODEL

Price locking occurs when:

- ORDER_ACCEPTED (Direct Order)
OR
- OFFER_SELECTED (Public Order)

At that moment:

- orders.locked_price is set.
- order_items.price_snapshot is frozen.
- Price becomes permanently immutable.

After price locking:

- Supplier inventory changes do NOT affect order.
- locked_price MUST NOT be updated.
- Historical totals MUST NOT be recalculated.
- Discounts require explicit financial events (no mutation).

------------------------------------------------------------

4. FINANCIAL PHASE ENTRY

Financial phase begins ONLY after:

ORDER_RECEIVED event.

Before ORDER_RECEIVED:

- FINANCIAL_DEBT_REGISTERED forbidden.
- FINANCIAL_CASH_REGISTERED forbidden.
- FINANCIAL_PAYMENT_REGISTERED forbidden.

Financial lifecycle is strictly post-pickup.

------------------------------------------------------------

5. FINANCIAL LEDGER STRUCTURE

Table: financial_events (Append-Only Ledger)

Fields:

- id (UUID, PK)
- company_id (UUID NOT NULL)
- order_id (UUID NOT NULL)
- event_type (CASH | DEBT | PAYMENT | TRANSFER)
- amount (numeric NOT NULL)
- currency (ISO code)
- created_at (UTC)
- metadata (JSONB)

Rules:

- Append-only.
- No UPDATE.
- No DELETE.
- No balance column stored.
- No derived totals stored.
- All balances computed from SUM(events).

Indexes:

- INDEX(company_id)
- INDEX(order_id)

------------------------------------------------------------

6. LEDGER SEMANTICS

Event meaning:

DEBT:
- Increases outstanding balance by amount.

PAYMENT:
- Decreases outstanding balance by amount.

CASH:
- Equivalent to full immediate settlement.
- Outstanding balance becomes zero via single ledger event.

TRANSFER:
- Reassigns receivable ownership between companies.
- Does NOT alter outstanding balance.
- Does NOT modify historical events.

Outstanding balance formula (deterministic):

Outstanding =
SUM(DEBT)
- SUM(PAYMENT)
- SUM(CASH)

TRANSFER does not affect balance.

Balance MUST NEVER be negative.
Overpayment is forbidden.

------------------------------------------------------------

7. CASH CLOSING

When trader selects CASH:

- Emit FINANCIAL_CASH_REGISTERED.
- Amount must equal locked_price.
- Outstanding balance becomes zero.
- Emit FINANCIAL_BALANCE_ZERO.

Process Manager listens to FINANCIAL_BALANCE_ZERO
→ Emits ORDER_COMPLETED.

Financial domain MUST NOT directly emit ORDER_COMPLETED.

------------------------------------------------------------

8. DEBT MODEL

When trader selects DEBT:

- Emit FINANCIAL_DEBT_REGISTERED.
- Amount must equal locked_price.
- Outstanding balance becomes locked_price.

Order remains RECEIVED until balance = 0.

Debt closes only when:

Outstanding balance = 0
→ Emit FINANCIAL_BALANCE_ZERO
→ Process Manager emits ORDER_COMPLETED.

------------------------------------------------------------

9. PARTIAL PAYMENTS

Each payment:

- Emits FINANCIAL_PAYMENT_REGISTERED.
- Must not exceed outstanding balance.
- Must be atomic.
- Must be idempotent.

Rules:

- amount > 0
- amount ≤ outstanding balance
- After payment, recompute outstanding deterministically.
- If outstanding = 0 → emit FINANCIAL_BALANCE_ZERO.

Each payment is immutable and independent.

------------------------------------------------------------

10. FINANCIAL COMPLETION RULES

Order reaches COMPLETED only when:

- FINANCIAL_BALANCE_ZERO emitted
AND
- Process Manager emits ORDER_COMPLETED.

After ORDER_COMPLETED:

- No further financial events allowed.
- No cancellation allowed.
- No ownership transfer allowed.
- Lifecycle becomes immutable.

------------------------------------------------------------

11. OWNERSHIP TRANSFER FINANCIAL IMPACT

Ownership transfer requires:

1. OWNERSHIP_TRANSFER_ACCEPTED event.
2. FINANCIAL_TRANSFER_REGISTERED event.
3. owner_company_id projection update.

TRANSFER rules:

- Does NOT change outstanding balance.
- Does NOT modify previous ledger entries.
- Must execute atomically.
- Must preserve tenant isolation.

Cross-aggregate mutation handled ONLY via Process Manager.

------------------------------------------------------------

12. MULTI-TENANT FINANCIAL ISOLATION

Every financial_event MUST include:

company_id

Rules:

- Queries MUST filter by company_id.
- No cross-tenant financial visibility.
- No shared aggregates across tenants.
- Transfer must respect tenant boundaries.

Isolation violations are critical security failures.

------------------------------------------------------------

13. CONCURRENCY & IDEMPOTENCY

Financial operations MUST:

- Execute inside DB transaction.
- Use optimistic locking on orders.
- Use persistent idempotency table.
- Prevent duplicate event emission.

Critical idempotent operations:

- Cash closing
- Debt registration
- Payment
- Ownership acceptance

Duplicate financial events are forbidden.

------------------------------------------------------------

14. DETERMINISTIC DERIVATION

Financial state MUST be derived from:

financial_events ordered by aggregate version.

Never rely on created_at alone.

Rebuilding ledger from events MUST produce identical balance.

Replay MUST NOT alter financial results.

------------------------------------------------------------

15. FORBIDDEN ACTIONS

The system MUST NEVER allow:

- Updating financial_events.
- Deleting financial_events.
- Storing derived balances as source of truth.
- Negative outstanding balance.
- Overpayment.
- Financial event before ORDER_RECEIVED.
- Completing order before financial resolution.
- Direct ORDER_COMPLETED from financial domain.

Any violation is a critical system error.

------------------------------------------------------------

FINAL FINANCIAL GUARANTEE

This Financial Model guarantees:

- Strict price immutability
- Immutable append-only ledger
- Deterministic balance derivation
- Proper debt lifecycle
- Safe partial payments
- Safe ownership transfer
- Tenant-isolated financial data
- Replay-safe financial reconstruction
- Strict aggregate boundaries

Financial integrity is absolute.
