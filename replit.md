# Arsan - B2B Multi-Tenant SaaS Platform

## Overview

Arsan is a B2B multi-tenant SaaS platform for auto parts trading. It connects traders (merchants) with suppliers, enabling catalog browsing, direct orders, public bid requests, and order lifecycle management including QR-based delivery confirmation and financial closure.

The project uses a monorepo structure with a **NestJS backend** (API-first, single source of truth) and a **Next.js frontend** (presentation only). The backend follows Clean Architecture with four layers: API, Application, Domain, and Infrastructure. Multi-tenancy is achieved via a shared database with a `company_id` tenant identifier on all tenant-scoped entities.

Backend core is complete (Phases 1-17). Frontend has login page and dashboard wired to backend API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Structure

```
/backend     — NestJS API server (port 8080)
/frontend    — Next.js frontend app (port 5000)
```

### Backend Architecture (Clean Architecture)

Each backend module follows a strict 4-layer structure:

```
src/modules/<module>/
  api/              — Controllers, DTOs, Guards (API Layer)
  application/      — Services, Use Cases (Application Layer)
  domain/           — Entities, Enums (Domain Layer)
  infrastructure/   — Repositories, Gateways (Infrastructure Layer)
```

**Dependency rule**: Dependencies point inward only. `API → Application → Domain`. Infrastructure implements Domain interfaces.

### Modules

Nine domain modules in `backend/src/modules/`:

| Module | Purpose | Status |
|---|---|---|
| **auth** | JWT authentication (register, login, guards, strategy) | Complete |
| **users** | User management (entity + service) | Complete |
| **companies** | Multi-tenant company management (entity + service) | Complete |
| **catalog** | Parts catalog (Category + Part entities, CRUD) | Complete |
| **vehicles** | Vehicle data | Scaffold |
| **orders** | Order lifecycle (Order + OrderItem + Offer, pickup, saga) | Complete |
| **notifications** | Real-time WebSocket notifications + DB persistence | Complete |
| **search** | Advanced search by name/OEM number | Complete |
| **finance** | Financial closing (immutable records, CASH/DEBT) | Complete |

### Common Infrastructure

- `common/events/` — `DomainEventBus` (EventEmitter-based, global via `EventsModule`)
- `common/decorators/` — `@CurrentUser()` decorator
- `common/database/` — `BaseEntity` (id, createdAt, updatedAt)
- `common/filters/` — Global exception filter
- `infrastructure/database/` — TypeORM PostgreSQL connection (`DatabaseModule`)
- `infrastructure/redis/` — Redis module

### Authentication & Authorization

- **Authentication**: JWT-based via Passport.js. Token extracted from Bearer header.
- **JWT Secret**: `process.env.JWT_SECRET || 'arsan_secret_2026'`
- **Guard**: `JwtAuthGuard` extends Passport's `AuthGuard('jwt')`
- **JWT Payload**: `{ sub: userId, companyId, role }`

### Multi-Tenancy

- Strategy: Shared database, shared schema, `companyId` column on all tenant-scoped entities
- All queries scoped by tenant via `@CurrentUser()` decorator
- Backend enforces tenant isolation

### Event-Driven Architecture

- `DomainEventBus` publishes events: `ORDER_CREATED`, `ORDER_COMPLETED`, `ORDER_FINANCIALLY_CLOSED`
- `OrderSaga` process manager listens and coordinates NotificationsService + SearchService
- Notifications are persisted to DB and pushed via WebSocket to company rooms

### API Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /auth/register | No | Register user + company |
| POST | /auth/login | No | Login, returns JWT |
| POST | /catalog/categories | JWT | Create category |
| POST | /catalog/parts | JWT | Create part |
| GET | /catalog | JWT | List catalog |
| POST | /orders | JWT | Create order |
| GET | /orders | JWT | List tenant orders |
| PATCH | /orders/:id/pickup | JWT | Confirm pickup with verification code |
| GET | /search/parts?query= | JWT | Search parts by name/OEM |
| POST | /finance/close-order | JWT | Financial closing (CASH/DEBT) |

### Frontend Architecture

- Next.js 16 with App Router (`frontend/src/app/`)
- TypeScript, React 19
- `axios` for API calls via `src/lib/api-client.ts` (auto-attaches JWT from localStorage)
- Pages: `/login` (auth form), `/` (dashboard with auth guard)
- RTL Arabic layout

### Running the Project

- **Backend**: `cd backend && npx nest start --watch` (port 8080)
- **Frontend**: `cd frontend && npm run dev -- -p 5000` (port 5000)
- Backend workflow: "Backend" (console, port 8080)
- Frontend workflow: "Frontend" (webview, port 5000)

### Database

- **PostgreSQL**: Connected via TypeORM (`synchronize: true` in dev)
- **Redis**: Module exists, planned for caching
- **Entities**: User, Company, Category, Part, Order, OrderItem, Offer, FinancialRecord, Notification

## External Dependencies

### Backend

| Package | Purpose |
|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | NestJS framework |
| `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` | JWT authentication |
| `@nestjs/typeorm`, `typeorm`, `pg` | PostgreSQL ORM |
| `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` | WebSocket real-time |
| `class-validator`, `class-transformer` | DTO validation |
| `bcrypt` | Password hashing |

### Frontend

| Package | Purpose |
|---|---|
| `next` (16.x) | React framework |
| `react`, `react-dom` (19.x) | UI library |
| `axios` | HTTP client for API calls |

## Phase Progress

All 17 backend phases complete. PHASE.lock: `PHASE_17_REALTIME_NOTIFICATIONS_COMPLETE` + `PROJECT_BACKEND_CORE_COMPLETED`. Frontend login + dashboard wired.
