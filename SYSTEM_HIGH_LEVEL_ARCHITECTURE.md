# SYSTEM_HIGH_LEVEL_ARCHITECTURE.md

## 1. System Purpose

The system is a multi-role order management platform that connects:

- Traders
- Suppliers
- Workshops
- Admins

It manages:

- Order lifecycle
- Financial settlement (cash or debt)
- Ownership transfer between traders
- Catalog and supplier inventory

The server is the single source of truth.

The UI never decides state.

---

## 2. System Boundaries

The system DOES NOT include:

- Electronic payment processing
- Delivery logistics
- Fund holding
- Wallet services

All payments are recorded, not processed.

---

## 3. Core Domains

The system is divided into four isolated domains:

1. Order Domain
2. Financial Domain
3. Ownership Domain
4. Catalog Domain

Each domain:

- Owns its state
- Executes its own transactions
- Emits events
- Does not access other domains directly

Cross-domain coordination happens only through a Process Manager.

---

## 4. Order Types

There are exactly two order types:

### A. Direct Order

- Trader selects product
- Selects specific supplier
- Sends order
- Supplier accepts or rejects

Price locks when supplier accepts.

### B. Public Request Order

- Trader publishes request
- Suppliers submit offers
- Trader selects one offer

Price locks when offer is selected.

After price locking:
Supplier price changes do not affect the order.

---

## 5. Order Lifecycle

The lifecycle is fixed and sequential:

1. Order Created
2. Waiting for Supplier / Collecting Offers
3. Accepted
4. Preparing
5. Ready for Pickup
6. Received (QR verified)
7. Financial Decision
8. Completed

Cancellation is allowed only before pickup.

No transitions allowed after final states.

---

## 6. Final States

An order reaches a final state when:

- Cancelled
- Rejected (before acceptance)
- Completed (after financial closing)

Final states are immutable.

---

## 7. Price Locking Rule

Price becomes immutable when:

- Supplier accepts (Direct Order)
- Trader selects offer (Public Request)

Price remains fixed regardless of future catalog updates.

---

## 8. Pickup (Atomic Operation)

Pickup is a single atomic server transaction:

- QR validation
- Order marked as Received
- Financial phase opened

After pickup:
Cancellation is permanently disabled.

---

## 9. Financial Model

No financial record is created before pickup.

After pickup, trader must choose:

- Cash closing
- Debt registration

Debt rules:

- Multiple partial payments allowed
- Each payment is recorded independently
- Debt automatically closes when balance reaches zero

Financial records are:

- Immutable
- Append-only
- Server-controlled

---

## 10. Ownership Transfer

Ownership transfer between traders:

1. Transfer request created
2. Second party accepts
3. Ownership changes
4. Financial event recorded

Ownership lifecycle is independent from order lifecycle.

---

## 11. State Management Model

The system enforces:

- Conditional state transitions
- Server-side validation
- Atomic operations
- Idempotent commands
- Race condition protection

State separation exists for:

- Order lifecycle state
- Financial state
- Ownership state
- Catalog state

Each state machine is isolated.

---

## 12. Event Logging

Every state change records:

- Entity ID
- Previous state
- New state
- Actor
- Timestamp

Event log is append-only.

State is derived from validated transitions, not UI assumptions.

---

## 13. Catalog Architecture

Two-layer model:

### Technical Catalog
Contains:
- Product ID
- Metadata
- Compatibility
- Approval state

Does NOT contain:
- Price
- Quantity
- Supplier data

### Supplier Inventory
Contains:
- Price
- Quantity
- Availability
- Tier pricing

Search starts from Technical Catalog.

Supported search modes:

- Text search
- VIN search (external API fallback)

---

## 14. Process Manager (Cross-Domain Coordination)

The Process Manager:

- Listens to domain events
- Applies cross-domain rules
- Dispatches commands
- Ensures eventual consistency

Domains do not call each other directly.

Example flows:

OrderAccepted → triggers preparation start  
OrderReceived → enables financial phase  
DebtClosed → marks order Completed  

---

## 15. Core Architectural Principles

- Server is authority
- Final states are immutable
- Price locks at acceptance
- No financial record before pickup
- Domains are isolated
- Coordination via Process Manager only
- UI reflects server state only
