# Architecture Rules

## Overview

This document defines the mandatory architectural rules for the Arsan platform.

These rules ensure:

* Clean Architecture integrity
* Clear separation of concerns
* Maintainable modular design
* Prevention of architectural decay

All contributors must follow these rules.

---

## Architectural Layers

The system is structured into four primary layers:

* API Layer
* Application Layer
* Domain Layer
* Infrastructure Layer

Each layer has strict responsibilities and dependency rules.

---

## Dependency Rule (Core Principle)

Dependencies must always point inward.

Allowed direction:

```id="lq8s21"
API → Application → Domain
Infrastructure → Domain (implements interfaces)
```

Forbidden direction:

* Domain importing Infrastructure
* Domain importing NestJS or framework-specific tools
* Application importing Infrastructure concrete implementations

---

## Layer Responsibilities

### Domain Layer

Purpose:

* Pure business logic
* Entities
* Value Objects
* Domain rules

Restrictions:

* No framework dependencies
* No database logic
* No HTTP logic

Domain must be framework-agnostic.

---

### Application Layer

Purpose:

* Use cases
* Orchestration of domain logic
* Transaction coordination

Responsibilities:

* Call domain logic
* Use interfaces (repositories, services)

Restrictions:

* Must not depend on infrastructure implementations.
* Must not contain HTTP/controller logic.

---

### API Layer

Purpose:

* Controllers
* Request/response handling
* Input validation
* Authentication guards

Responsibilities:

* Translate HTTP requests into application commands.

Restrictions:

* No business logic.
* No direct database access.

---

### Infrastructure Layer

Purpose:

* Database implementations
* External services
* Redis, queues, integrations

Responsibilities:

* Implement interfaces defined by application/domain.

Restrictions:

* Must not contain business logic.

---

## Module Boundaries

Each module represents a bounded context.

Rules:

* Modules must not access each other’s internal implementation.
* Communication must occur through application services or defined interfaces.
* Direct repository access across modules is forbidden.

---

## Repository Rules

* Repositories are interfaces defined in domain or application layer.
* Infrastructure provides implementations.
* Controllers must never directly query database.

---

## Multi-Tenancy Enforcement

All tenant-owned operations must:

* Include company_id filtering.
* Use repository layer enforcement.
* Never rely on controller-level filtering.

See MULTI_TENANCY.md for details.

---

## Forbidden Practices

The following are strictly prohibited:

* Business logic inside controllers.
* Database queries inside domain layer.
* Importing infrastructure into domain.
* Cross-module entity manipulation.
* Hardcoding tenant logic outside defined mechanisms.

---

## Code Review Enforcement

During code review:

* Check dependency direction.
* Verify layer responsibilities.
* Ensure module boundaries are respected.

Architectural violations must be rejected.

---

## Future Evolution

As system complexity increases:

* Event-driven patterns may be introduced.
* Background workers may be added.

These additions must respect existing architectural boundaries.

---

## Summary

Arsan follows strict Clean Architecture principles.

Maintaining these rules ensures:

* Scalability
* Maintainability
* Clear separation of concerns
* Long-term architectural stability
