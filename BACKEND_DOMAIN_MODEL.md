# Domain Model

## Overview

This document defines the domain structure of the Arsan platform.

The purpose of this file is to:

* Define bounded contexts
* Establish domain ownership boundaries
* Prevent cross-module coupling
* Provide a shared mental model for developers

This is NOT a database schema definition.

---

## Domain Philosophy

Arsan follows:

* Domain-Driven Design (DDD) principles
* Modular architecture
* Bounded contexts with clear responsibilities

Each module represents a bounded context responsible for its own business logic and data.

---

## Bounded Contexts

### 1. Identity Context (Auth & Users)

Responsibilities:

* Authentication
* User identity
* Login sessions
* User roles within a company

Core Entities:

* User
* Role
* Permission

Notes:

* Identity is global but roles may be tenant-specific.

---

### 2. Company Context

Responsibilities:

* Company (tenant) management
* Company configuration
* Company ownership

Core Entities:

* Company

Notes:

* Company represents tenant boundary.
* All tenant-owned data references company_id.

---

### 3. Catalog Context

Responsibilities:

* Products or items offered
* Classification and categorization
* Product metadata

Core Entities:

* Product
* Category

---

### 4. Vehicles Context

Responsibilities:

* Vehicle definitions
* Vehicle specifications
* Company vehicle assets

Core Entities:

* Vehicle

Notes:

* Vehicles belong to a specific company.

---

### 5. Orders Context

Responsibilities:

* Order lifecycle
* Order state transitions
* Business workflows

Core Entities:

* Order
* OrderItem

Notes:

* Orders act as a core business aggregate.
* External modules should not directly modify order internals.

---

## Context Relationships

High-level relationships:

* Identity Context provides users for all modules.
* Company Context defines tenant ownership.
* Orders may reference Catalog and Vehicles.
* Catalog and Vehicles MUST remain independent from Orders logic.

---

## Aggregate Ownership

Each bounded context owns its aggregates.

Rules:

* External modules interact via application services.
* Direct database access across contexts is forbidden.
* No cross-context entity modification.

---

## Domain Communication

Communication between contexts should happen through:

* Application layer services
* Domain events (future consideration)

Avoid tight coupling between modules.

---

## Naming Conventions

* Entities represent business concepts.
* Avoid technical naming inside domain layer.
* Domain must remain framework-agnostic.

---

## Non-Goals

This document does NOT define:

* Database tables
* API endpoints
* Infrastructure details

---

## Future Evolution

As the system grows:

* New bounded contexts may be added.
* Aggregates may evolve.
* Domain events may be introduced.

Any structural change must update this document.

---

## Summary

The Arsan domain is divided into clear bounded contexts:

* Identity
* Company
* Catalog
* Vehicles
* Orders

Maintaining strict boundaries between contexts ensures scalability, maintainability, and architectural consistency.
