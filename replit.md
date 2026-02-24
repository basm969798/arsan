# Arsan - B2B Multi-Tenant SaaS Platform

## Overview

Arsan is a B2B multi-tenant SaaS platform for auto parts trading. It connects traders (merchants) with suppliers, enabling catalog browsing, direct orders, public bid requests, and order lifecycle management including QR-based delivery confirmation and financial closure.

The project uses a monorepo structure with a **NestJS backend** (API-first, single source of truth) and a **Next.js frontend** (presentation only). The backend follows Clean Architecture with four layers: API, Application, Domain, and Infrastructure. Multi-tenancy is achieved via a shared database with a `company_id` tenant identifier on all tenant-scoped entities.

The project is in early scaffold phase — module structures exist but most contain no business logic yet. Only the Auth module has a working JWT login flow (currently with hardcoded credentials).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Structure

```
/backend     — NestJS API server (port 3000)
/frontend    — Next.js frontend app
/             — Root package.json with setup scripts
```

### Backend Architecture (Clean Architecture)

Each backend module follows a strict 4-layer structure:

```
src/modules/<module>/
  api/              — Controllers, DTOs, Guards (API Layer)
  application/      — Services, Use Cases (Application Layer)
  domain/           — Entities, Interfaces, Enums (Domain Layer) [not yet created]
  infrastructure/   — Repositories, external integrations (Infrastructure Layer) [not yet created]
```

**Dependency rule**: Dependencies point inward only. `API → Application → Domain`. Infrastructure implements Domain interfaces. Domain must never import Infrastructure or framework-specific code.

### Modules

Eight domain modules are scaffolded in `backend/src/modules/`:

| Module | Purpose | Status |
|---|---|---|
| **auth** | JWT authentication (login, guards, strategy) | Basic working scaffold |
| **users** | User management | Stub with mock data |
| **companies** | Multi-tenant company management | Empty scaffold |
| **catalog** | Parts catalog | Empty scaffold |
| **vehicles** | Vehicle data | Empty scaffold |
| **orders** | Order lifecycle (direct + public bid) | Empty scaffold |
| **notifications** | Notification system | Empty scaffold |
| **search** | Search functionality | Empty scaffold |

### Authentication & Authorization

- **Authentication**: JWT-based via Passport.js. Token extracted from Bearer header. Strategy in `auth/infrastructure/jwt.strategy.ts`.
- **Authorization**: Tenant-scoped RBAC (Role-Based Access Control). JWT payload carries `sub` (userId), `companyId`, and `role`. Not yet fully implemented.
- **Guard**: `JwtAuthGuard` extends Passport's `AuthGuard('jwt')`.
- **Secret**: Uses `JWT_SECRET` env var, falls back to `'dev-secret'` in development.

### Multi-Tenancy

- Strategy: **Shared database, shared schema, tenant identifier column** (`company_id`).
- All tenant-owned entities must include `company_id`.
- All queries must be scoped by tenant.
- Backend enforces tenant isolation — frontend never makes cross-tenant decisions.

### Order System (Business Logic — Not Yet Implemented)

Two order types:
1. **Direct Order**: Trader selects supplier → supplier accepts/rejects → price locked on acceptance.
2. **Public Bid**: Trader posts request → suppliers submit offers → trader picks one → price locked on selection.

Order lifecycle: Create → Await response → Accept/Select → Prepare → QR delivery confirmation → Financial closure (cash close).

### Frontend Architecture

- Next.js 16 with App Router (`frontend/src/app/`)
- TypeScript, React 19
- Currently default Next.js scaffold — no business UI implemented yet
- Will consume backend API exclusively — no business logic in frontend

### Running the Project

- **Backend**: `cd backend && npm install && npm run start:dev` (runs on port 3000, or `PORT` env var)
- **Frontend**: `cd frontend && npm install && npm run dev` (runs on port 3000 by default — will need different port)
- **Root scripts**: `npm run dev` runs `setup.sh` (bash script, may not exist yet)

**Important**: Backend and frontend both default to port 3000. When running together, set different ports (e.g., backend on 3001 or frontend on 3001).

### Database

- **Target**: PostgreSQL (not yet connected — no ORM/database driver installed)
- **Cache**: Redis (planned, not yet integrated)
- Neither database nor Redis has been set up yet. When adding database support, use PostgreSQL with an ORM (TypeORM or Drizzle — not yet decided in codebase).

## External Dependencies

### Backend (`backend/package.json`)

| Package | Purpose |
|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | NestJS framework |
| `@nestjs/jwt` | JWT token generation/verification |
| `@nestjs/passport`, `passport`, `passport-jwt` | Authentication strategy |
| `class-validator`, `class-transformer` | DTO validation and transformation |
| `reflect-metadata` | Decorator metadata (required by NestJS) |
| `rxjs` | Reactive extensions (NestJS dependency) |

### Frontend (`frontend/package.json`)

| Package | Purpose |
|---|---|
| `next` (16.x) | React framework |
| `react`, `react-dom` (19.x) | UI library |

### Not Yet Added (Planned)

- **PostgreSQL driver** (e.g., `pg`, `typeorm`, or `drizzle-orm` + `drizzle-kit`) — needed for database
- **Redis client** (e.g., `ioredis` or `@nestjs/cache-manager`) — needed for caching
- **bcrypt** — listed in root `package.json` but not in backend's `package.json`; needed for password hashing

### Infrastructure (Production)

- Docker + Docker Compose for containerization
- Nginx Proxy Manager for SSL termination and routing
- PostgreSQL and Redis containers (not publicly exposed)