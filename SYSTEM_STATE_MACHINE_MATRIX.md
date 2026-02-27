SYSTEM_STATE_MACHINE_MATRIX.md
ORDER STATE MACHINE MATRIX
0. Purpose

This document defines the formal state transition matrix for Orders.

These transitions are:

Strict

Non-negotiable

Enforced at domain level

Mandatory for AI and human implementations

If a transition is not explicitly allowed here:

It is forbidden.

1. Order States Definition
State	Description	Terminal
DRAFT	Order created but not finalized	No
SUBMITTED	Order submitted for processing	No
OFFERED	Supplier has submitted offer	No
ACCEPTED	Offer accepted, price locked	No
PREPARING	Order is being prepared	No
READY	Order ready for pickup/delivery	No
COMPLETED	Order fulfilled successfully	Yes
CANCELLED	Order cancelled	Yes
REJECTED	Offer rejected	Yes
2. Allowed Transitions
2.1 Transition Matrix
From	To	Allowed	Emits Event
DRAFT	SUBMITTED	✅	ORDER_SUBMITTED
SUBMITTED	OFFERED	✅	OFFER_CREATED
OFFERED	ACCEPTED	✅	OFFER_ACCEPTED
OFFERED	REJECTED	✅	OFFER_REJECTED
ACCEPTED	PREPARING	✅	ORDER_PREPARING
PREPARING	READY	✅	ORDER_READY
READY	COMPLETED	✅	ORDER_COMPLETED
DRAFT	CANCELLED	✅	ORDER_CANCELLED
SUBMITTED	CANCELLED	✅	ORDER_CANCELLED
OFFERED	CANCELLED	✅	ORDER_CANCELLED
ACCEPTED	CANCELLED	⚠️ Only before preparation	ORDER_CANCELLED
3. Forbidden Transitions

The following transitions are explicitly forbidden:

DRAFT → ACCEPTED

SUBMITTED → READY

OFFERED → COMPLETED

ACCEPTED → COMPLETED

PREPARING → ACCEPTED

COMPLETED → Any

CANCELLED → Any

REJECTED → Any

Final states (COMPLETED, CANCELLED, REJECTED) are immutable.

4. Transition Rules
4.1 Event Requirement

Every valid transition MUST:

Emit corresponding domain event.

Be validated at domain layer.

Be tenant-scoped.

Direct status mutation is forbidden.

4.2 Financial Coupling Rules

Transition to ACCEPTED MUST trigger price lock.

Transition to COMPLETED MUST verify financial consistency.

Cancellation after ACCEPTED requires financial reconciliation event.

4.3 Authorization Constraints

Only authorized roles may perform transitions.

Tenant validation MUST occur before transition.

Super Admin override must be logged.

5. Validation Requirements

Implementation MUST:

Validate current state before transition.

Reject illegal transitions.

Ensure atomic transaction for:

State change

Event emission

Financial updates (if applicable)

6. Idempotency Rules

Repeating same transition request must not duplicate effects.

Duplicate ACCEPTED event must be rejected.

Duplicate COMPLETED event must be rejected.

7. Concurrency Control

Optimistic locking MUST be enforced.

Transition must fail if state version mismatches.

No race condition allowed between ACCEPTED and CANCELLED.

8. Agent Execution Constraints

AI Agents:

MUST:

Follow this matrix strictly.

Not invent new states.

Not skip transitions.

Not merge transitions.

Not bypass financial triggers.

MUST NOT:

Mutate status directly.

Override final states.

Ignore concurrency validation.

If state not found in matrix:
→ Agent must request clarification.

9. Future State Extension Rule

Adding new states requires:

Update SYSTEM_STATE_MACHINE_MATRIX.md

Update SYSTEM_EVENT_MODEL.md

Update SYSTEM_INVARIANTS.md

Migration strategy definition

No new state may exist without updating this file.

FINAL RULE

If implementation allows transition not defined here:

The implementation is invalid.

This matrix is the authoritative lifecycle definition.
