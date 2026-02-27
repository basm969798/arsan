# 🧠 ARCHITECT EXECUTION PLAN — ARSAN

This file defines deterministic execution for AI agents.

It DOES NOT replace README rules.
It defines execution sequencing only.

---

## GLOBAL RULES

* Follow PHASE.lock strictly.
* Never skip phases.
* Scaffold first, freeze after.
* No business logic before allowed phase.
* Backend is the single source of truth.
* Multi-tenant enforcement required.
* Respect Clean Architecture:

api/
application/
domain/
infrastructure/

---

## CURRENT STATE

PHASE_1 completed.
PHASE_2 foundation scaffold started.

Agent must NOT re-analyze repository.
Agent must execute deterministic micro-steps only.

---

## EXECUTION STRATEGY

Each phase must follow:

1. Create minimal scaffold only.
2. No logic implementation.
3. Stop immediately after scaffold.
4. Wait for next instruction.

---

# EXECUTION ROADMAP

---

## PHASE_2 — CORE FOUNDATION

Create only:

* JWT structure placeholders
* Auth guard shell
* Strategy shell
* Tenant context
* Role enum
* Request tenant resolver

FREEZE.

---

## PHASE_3 — INFRASTRUCTURE LAYER

Create only:

* Config module scaffold
* PostgreSQL connection shell
* Redis module scaffold
* Base repository interface
* Global exception filter shell
* /health endpoint controller

FREEZE.

---

## PHASE_4 — ORDER ENGINE

Create only:

* Order domain entity skeleton
* Order state enum
* Transition guard structure
* Event interface structure
* Application service shell
* Controller shell
* Idempotency interface

FREEZE.

---

## PHASE_5 — FINANCIAL EVENTS

Create only:

* FinancialEvent entity skeleton
* FinancialState enum
* Debt entity shell
* Payment entity shell
* Financial service shell

FREEZE.

---

## PHASE_6 — CATALOG CORE

Create only:

* Technical catalog entity
* Catalog status enum
* Supplier inventory entity
* Admin review service shell
* Catalog controller shell

FREEZE.

---

## PHASE_7 — VEHICLES

Create only:

* Vehicle entity
* VIN abstraction interface
* VIN service shell
* Cache abstraction

FREEZE.

---

## PHASE_8 — SEARCH

Create only:

* Search abstraction
* Normalization utility
* Ranking interface
* Controller shell

FREEZE.

---

## PHASE_9 — NOTIFICATIONS

Create only:

* Notification entity
* NotificationType enum
* Event listener scaffold
* External adapter shell
* Notification controller

FREEZE.

---

## PHASE_10 — MULTI-TENANT ENFORCEMENT

Create only:

* BaseTenantEntity
* Tenant guard integration
* Repository tenant scoping
* Query interceptor

FREEZE.

---

## PHASE_11 — SECURITY HARDENING

Add only:

* Rate limiting scaffold
* Helmet config shell
* Global validation pipe
* Role permission structure

FREEZE.

---

## PHASE_12 — DATABASE MAPPING

Create only:

* ORM mapping shells
* Migration structure
* Repository implementations
* Transaction abstraction

FREEZE.

---

## PHASE_13 — PRODUCTION PREPARATION

Create only:

* Dockerfile skeletons
* docker-compose structure
* Environment config structure
* Health check integration
* CI pipeline skeleton

FREEZE.

---

END OF EXECUTION PLAN.
