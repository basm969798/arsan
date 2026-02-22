# 🤖 AGENT EXECUTION CONTEXT — PHASE HARD LOCK (DO NOT MODIFY)

You are building the Arsan platform.

PHASE LOCK ACTIVE:
Current phase: PHASE_1_SCAFFOLD_ONLY.

CRITICAL:
You MUST ignore all phases beyond PHASE_1.
You MUST NOT read or analyze SYSTEM_DESIGN.md during this phase.
You MUST NOT implement business logic.
You MUST NOT implement database logic.
You MUST NOT generate domain entities.
You MUST NOT modify architecture documents.

Allowed scope:
- setup.sh
- backend scaffold
- frontend scaffold
- Clean Architecture folder structure

Execution order:
1) Run setup.sh
2) Verify backend scaffold created
3) Verify frontend scaffold created
4) Verify clean architecture folders created
5) STOP immediately after verification

DO NOT CONTINUE beyond scaffold generation.

# Arsan — BUILD PLAN

This document defines the official build roadmap for the Arsan platform.

The AI agent must follow phases strictly.

DO NOT skip phases.

DO NOT implement business logic until instructed.

---

## PROJECT TYPE

B2B Multi-tenant SaaS platform.

Architecture principles:

- Backend is API-first.
- Backend is single source of truth.
- Clean Architecture layers required.
- Domain-driven modular structure.

---

## REQUIRED TECHNOLOGY

Backend:

- NestJS
- PostgreSQL
- Redis

Frontend:

- Next.js (separate)

Infrastructure:

- Docker (production only)

---

## CLEAN ARCHITECTURE STRUCTURE

All backend modules must follow:

api/
application/
domain/
infrastructure/

---

## MODULES REQUIRED

Create under:

backend/src/modules/

Modules:

- auth
- companies
- users
- catalog
- vehicles
- orders
- notifications
- search

---

## PHASE 1 — SCAFFOLD ONLY

Goal:

Create NestJS backend structure.

Requirements:

- Initialize NestJS inside backend folder.
- Create modules folders.
- Create clean architecture layer folders.
- No business logic.
- No database logic.

---

## PHASE 2 — CORE FOUNDATION

Add:

- Basic authentication (JWT structure only).
- Multi-tenant context support.
- Request tenant identification.

DO NOT implement full auth flows.

---

## PHASE 3 — INFRASTRUCTURE SETUP

Add:

- PostgreSQL connection.
- Redis connection.
- Repository base pattern.

No domain logic yet.

---

## PHASE 4 — ORDERS ENGINE (CORE SYSTEM)

Start building:

- Order lifecycle structure.
- State machine scaffolding.
- Domain entities only.

---

## PHASE 5 — CATALOG + VEHICLES

Structure catalog system.

---

## PHASE 6 — SEARCH

Add search module structure.

---

## PHASE 7 — NOTIFICATIONS

Add notification architecture.

---

## RULES

- No business logic in controllers.
- Backend enforces tenant isolation.
- company_id required for core entities.
- Follow SYSTEM_DESIGN.md strictly.

---

## FINAL GOAL

A professional scalable NestJS backend matching BACKEND_STRUCTURE.md exactly.



