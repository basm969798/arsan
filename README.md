🤖 AGENT EXECUTION CONTEXT — AI ARCHITECT MODE

Project: Arsan

========================
ARCHITECT EXECUTION MODE ACTIVE

Follow build phases strictly.
Do not skip phases.
Do not implement business logic until phase instructions require it.

========================
EXECUTION RULES

Minimize token usage.
Avoid unnecessary analysis.
Execute required scaffold tasks only when specified by phase.

========================
BUILD ROADMAP

PROJECT TYPE
B2B Multi-tenant SaaS platform.

Architecture principles:

Backend is API-first.
Backend is single source of truth.
Clean Architecture layers required.
Domain-driven modular structure.

REQUIRED TECHNOLOGY

Backend:
NestJS
PostgreSQL
Redis

Frontend:
Next.js (separate)

Infrastructure:
Docker (production only)

CLEAN ARCHITECTURE STRUCTURE

All backend modules must follow:

api/
application/
domain/
infrastructure/

MODULES REQUIRED

Under:

backend/src/modules/

auth
companies
users
catalog
vehicles
orders
notifications
search

PHASE 1 — SCAFFOLD
Create NestJS backend structure.
Initialize backend folder.
Create modules folders.
Create clean architecture layer folders.

PHASE 2 — CORE FOUNDATION
Add basic JWT structure.
Add multi-tenant context support.

PHASE 3 — INFRASTRUCTURE SETUP
Add PostgreSQL connection.
Add Redis connection.
Add repository base pattern.

PHASE 4 — ORDERS ENGINE
Build order lifecycle structure.
State machine scaffolding.

PHASE 5 — CATALOG + VEHICLES
Structure catalog system.

PHASE 6 — SEARCH
Add search module structure.

PHASE 7 — NOTIFICATIONS
Add notification architecture.

FINAL GOAL
Professional scalable NestJS backend matching BACKEND_STRUCTURE.md.
