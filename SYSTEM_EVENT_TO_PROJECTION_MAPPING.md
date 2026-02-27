SYSTEM_EVENT_TO_PROJECTION_MAPPING.md
EVENT → PROJECTION → FINANCIAL IMPACT MAPPING
0. Purpose

This document defines the authoritative mapping between:

Domain Events

Data Projections

Financial Impact (if applicable)

No projection may change state unless triggered by a valid event.

If an update occurs without a corresponding event:

It is a violation of system invariants.

1. Core Principle

The system follows:

Event-first architecture

Append-only event store

Deterministic projections

Explicit financial coupling

All derived state must be rebuildable from events.

2. Order Domain Event Mapping
2.1 ORDER_SUBMITTED

Trigger: DRAFT → SUBMITTED

Projection Updates:

orders.status = SUBMITTED

orders.submitted_at = timestamp

Financial Impact:

None

2.2 OFFER_CREATED

Trigger: Supplier submits offer

Projection Updates:

offers.status = CREATED

offers.price = proposed_price

offers.created_at = timestamp

Financial Impact:

None

2.3 OFFER_ACCEPTED

Trigger: OFFERED → ACCEPTED

Projection Updates:

orders.status = ACCEPTED

orders.locked_price = offer.price

offers.status = ACCEPTED

orders.price_locked_at = timestamp

Financial Impact:

Emit FINANCIAL_EVENT: PRICE_LOCKED

Ledger reference created

⚠ Price must be copied and frozen at this point.

2.4 OFFER_REJECTED
Projection Updates:

offers.status = REJECTED

Financial Impact:

None

2.5 ORDER_PREPARING

Trigger: ACCEPTED → PREPARING

Projection Updates:

orders.status = PREPARING

orders.preparing_at = timestamp

Financial Impact:

None

2.6 ORDER_READY

Trigger: PREPARING → READY

Projection Updates:

orders.status = READY

orders.ready_at = timestamp

Financial Impact:

None

2.7 ORDER_COMPLETED

Trigger: READY → COMPLETED

Projection Updates:

orders.status = COMPLETED

orders.completed_at = timestamp

Financial Impact:

Validate ledger consistency

Emit FINANCIAL_EVENT: ORDER_SETTLED (if applicable)

2.8 ORDER_CANCELLED
Projection Updates:

orders.status = CANCELLED

orders.cancelled_at = timestamp

Financial Impact:

If price was locked:

Emit FINANCIAL_EVENT: REVERSAL

Create compensating ledger entry

3. Financial Event Mapping
3.1 CASH_PAYMENT_RECEIVED
Projection Updates:

payments.status = CONFIRMED

ledger.balance += amount

3.2 DEBT_CREATED
Projection Updates:

ledger.outstanding_debt += amount

3.3 PAYMENT_SETTLED
Projection Updates:

ledger.outstanding_debt -= amount

ledger.balance += amount

3.4 REVERSAL_EVENT
Projection Updates:

Reverse previous ledger effect

Mark reference event as reversed

4. Projection Integrity Rules

Projections are derived.

Projections may be rebuilt at any time.

No projection may mutate financial totals directly.

Projection logic must be deterministic.

Projection rebuild must produce identical state.

5. Forbidden Actions

The system forbids:

Updating orders.status without event

Updating offers.price after lock

Updating ledger.balance directly

Deleting financial_events

Modifying event payload

6. Atomicity Requirements

Every transition that affects:

State

Event

Financial record

Must occur in a single atomic transaction.

Partial success is forbidden.

7. Rebuild Requirement

The system MUST support:

Full projection rebuild from event store

Financial ledger reconstruction

Order state reconstruction

If rebuild produces different result:

→ The system is invalid.

8. Agent Execution Constraints

AI Agents:

MUST:

Emit event before projection update

Follow mapping strictly

Respect financial coupling

MUST NOT:

Update projections directly

Skip financial reconciliation

Merge multiple transitions into implicit mutation

If event not mapped here:
→ Agent must request architectural update.

9. Extension Rule

Adding new event requires:

Update SYSTEM_EVENT_MODEL.md

Update SYSTEM_STATE_MACHINE_MATRIX.md (if lifecycle related)

Update this file

Define projection & financial mapping

No event may exist without explicit mapping.

FINAL RULE

If a projection change exists without matching event:

The projection is invalid.

If financial balance changes without financial event:

The system is corrupted.
