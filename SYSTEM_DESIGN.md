🏛 FINAL BUSINESS LOGIC (Unified & Architecturally Structured)
1️⃣ Order Types

There are only two types of orders in the system:

A — Direct Order

Trader selects item from catalog.

Chooses specific supplier.

Sends order directly.

Supplier actions:

Accept

Reject

When supplier accepts:

👉 Price becomes locked inside the order.

B — Public Request Order

Trader publishes request without selecting supplier.

Eligible suppliers submit offers.

Trader selects exactly one offer.

When offer is selected:

👉 Price becomes locked inside the order.

2️⃣ Order Lifecycle (Core Flow)

The lifecycle is fixed and cannot be skipped:

Order creation

Waiting for supplier / collecting offers

Acceptance or offer selection

Order preparation

Pickup via QR

Financial closing

No step can be bypassed.

3️⃣ Price Locking

Price becomes immutable when:

Supplier accepts (direct order)

Trader selects offer (public request)

Later supplier price updates:

❌ Do NOT affect existing orders.

4️⃣ Pickup (Atomic Operation)

Pickup is a single atomic server-side transaction:

QR verification

Pickup confirmation

State moves to Received

Financial phase opens

After pickup:

❌ No cancellation allowed.

5️⃣ Financial Closing (Mandatory Decision)

After pickup, trader must choose:

✅ Cash closing

✅ Debt registration

Order cannot finish without this decision.

6️⃣ Financial Records

Golden rule:

👉 No financial record is created before pickup completion.

Financial records are:

Immutable

Append-only

Event-based

7️⃣ Partial Payments

If debt is selected:

Multiple payments allowed

Each payment = independent financial event

Debt closes automatically when balance reaches zero

8️⃣ Ownership Transfer Between Traders

Flow:

Transfer request sent

Second party accepts

Ownership transferred

Financial event recorded

Ownership state is independent from order lifecycle state.

9️⃣ Cancellation & Rejection Rules

Before acceptance:

Trader may cancel if supplier does not respond.

If supplier rejects:

Order returns to open state.

Trader may:

Select another supplier

Convert to public request

After supplier acceptance:

Cancellation allowed only before pickup.

After pickup:
❌ No cancellation allowed.

🔟 System Boundaries (Fixed)

No electronic payments

No delivery system

Platform does NOT hold funds

⭐ Role Responsibility
Operation	Responsible
Order creation	Trader
Order acceptance	Supplier
Order preparation	Supplier
Pickup	Trader
Financial closing	Trader

Subscription is NOT a role.

Roles:

Supplier

Trader

Workshop

Admin

Each role has strictly defined permissions.

⭐ Final Order States

An order is finished when:

Cancelled

Cash closed

Debt closed

Final states:

Completed

Rejected

Cancelled

No transitions allowed after final state.

🔥 Unified State Management
Order States

New

Waiting for supplier

Accepted

Preparing

Ready for pickup

Received

Completed

Rejected

Cancelled

State Ownership Rules
Transition	Actor
New → Waiting	System
Waiting → Accepted	Supplier
Waiting → Rejected	Supplier
Accepted → Preparing	Supplier
Preparing → Ready	Supplier
Ready → Received	Trader (QR)
Received → Completed	Trader (financial decision)
Waiting → Cancelled	Trader (before acceptance)

Server validates all transitions.

🧾 Event Logging (Mandatory)

Every state change logs:

Order ID

Previous state

New state

Actor

Timestamp

Event log is append-only.

⚙ Concurrency & Consistency Rules

Server is single source of truth.

Conditional state transitions required.

All operations atomic.

Idempotency enforced.

Race condition protection.

Safe retries supported.

Late operations rejected.

Price locking enforced at acceptance.

Event ordering determined by server.

State separation enforced:

Separate states:

Order lifecycle state

Financial state

Ownership state

Catalog state

Golden rule:

👉 UI never decides state.
👉 Server decides state.

📦 Catalog Architecture

Two-layer model:

Technical Catalog

Contains:

Product ID

Metadata

Compatibility

Approval state

Does NOT contain:

Price

Quantity

Supplier data

Supplier Inventory Layer

Contains:

Price

Quantity

Availability

Tier pricing

🔎 Search Architecture

Two modes:

Text search

VIN search (fallback external API)

Search always begins from Technical Catalog.

🧠 Unified Event-Based Architecture

State is NOT stored as static truth.

State is derived from:

1️⃣ Events
2️⃣ Transition rules
3️⃣ Process coordination

Golden rule:

👉 State = Events + Rules
👉 Not a static database field

🧩 System Layers (Architectural View)

Events Layer
All changes are emitted as domain events.

State Projection Layer
Current state derived from events.

Transition Rules Layer
Validates allowed state changes.

Process Manager (Saga Coordination)

4️⃣ Process Manager (Saga Coordination)
Purpose

Handle complex workflows across multiple domains without breaking isolation.

Responsibilities

The Process Manager:

Listens to domain events

Applies business rules

Dispatches commands to domains

Coordinates cross-domain flows

Ensures eventual consistency

Architectural Rules

Domains NEVER call other domains directly.

Domains NEVER share transactions.

Communication only via events.

Cross-domain consistency handled via Saga.

Each domain remains isolated.

Example Cross-Domain Flows
Order Acceptance

OrderAccepted event →
Process Manager →
Triggers price lock + preparation start.

Pickup

OrderReceived event →
Process Manager →
Opens financial decision phase.

Debt Flow

DebtRegistered →
DebtPaymentRecorded →
Process Manager checks balance →
If zero → emits DebtClosed →
Moves order to Completed.

🏗 Domain Isolation

Separated domains:

Order Domain

Financial Domain

Ownership Domain

Catalog Domain

Each domain:

Owns its state

Emits its events

Has independent transactions

Does not access other domain internals

🏁 Ultimate System Principles

Server is authority.

State derived from events.

Price locks at acceptance.

No financial record before pickup.

Final states are immutable.

Domains are isolated.

Coordination via Process Manager only.

Event log is source of truth.

🔥 Absolute Golden Rules

👉 Server decides state.
👉 UI displays state.
👉 Domains remain independent.
👉 Coordination happens only through Events + Process Manager.
👉 State is a derived result — not a stored assumption.
