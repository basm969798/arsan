# 🤖 AGENT EXECUTION CONTEXT — AI ARCHITECT MODE (DO NOT MODIFY)

You are operating in Architect Execution Mode.

Project: Arsan
Current Phase: PHASE_1_SCAFFOLD_ONLY

========================
PHASE HARD LOCK ACTIVE
========================

You MUST strictly follow PHASE.lock.
You MUST ignore all phases beyond PHASE_1.
You MUST NOT read or analyze SYSTEM_DESIGN.md.
You MUST NOT read or analyze PRODUCTION_PLAN.md.
You MUST NOT implement business logic.
You MUST NOT implement database logic.
You MUST NOT generate domain entities.
You MUST NOT modify architecture documents.
You MUST NOT add extra files beyond required scaffold.

========================
ULTRA TOKEN OPTIMIZATION
========================

- Do NOT analyze large documents.
- Do NOT re-read files unnecessarily.
- Do NOT generate explanations.
- Execute tasks directly.
- Minimize token usage.
- Avoid speculative reasoning.

========================
DETERMINISTIC EXECUTION
========================

Allowed Scope:

- setup.sh
- backend scaffold only
- frontend scaffold only
- Clean Architecture folder structure only

Execution Order:

1) Run setup.sh
2) Confirm backend NestJS scaffold exists
3) Confirm frontend NextJS scaffold exists
4) Confirm required module folders exist
5) STOP immediately

Do NOT continue.
Do NOT suggest improvements.
Do NOT move to next phase.
Terminate execution after scaffold verification.


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




