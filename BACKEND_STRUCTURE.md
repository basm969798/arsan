# Backend Structure - Arsan

---

## 🧱 Architecture Layers

1) API Layer
- Controllers
- Routes
- DTO / Validation
- Request handling

2) Application Layer
- Services
- Use Cases
- Workflow Logic
- Business operations

3) Domain Layer
- Entities
- Business Rules
- Enums
- Interfaces
- State management

4) Infrastructure Layer
- Database (PostgreSQL)
- Redis
- Repositories
- External integrations
- Config

---

## 📦 Modules (Domain Modules)

- Auth Module
- Companies Module (Multi-tenant)
- Users Module
- Catalog Module
- Vehicles Module
- Orders Module
- Notifications Module
- Search Module

---

## ⭐ Module Structure

Each module follows:

module-name/

  api/
    controllers/
    dto/

  application/
    services/
    use-cases/

  domain/
    entities/
    interfaces/
    enums/

  infrastructure/
    repositories/
    integrations/

---

## 🔒 System Boundaries

- Backend is API-first.
- Frontend communicates via HTTP API only.
- No direct database access from frontend.
- All business logic lives inside backend.

---

## 🏢 Multi-tenant Rules

- Every business entity belongs to a company.
- company_id required for core entities.
- Users always linked to a company.
- Data isolation between companies.

---

## 🔄 Flow Rule

Controller → Application Service → Domain → Repository

---

## 🔥 Rules

- No business logic inside controllers.
- Controllers call application services only.
- Domain layer contains pure business logic.
- Infrastructure handles database and external systems.

