# Authorization Strategy

## Overview

This document defines the official authorization model for the Arsan platform.

Arsan is a multi-tenant SaaS system where:

* Multiple companies (tenants) coexist
* Users belong to companies
* Access must be strictly scoped per tenant

Authentication verifies identity.
Authorization controls access.

This document defines authorization only.

---

## Authorization Model

Arsan uses a **Tenant-Scoped Role-Based Access Control (RBAC)** model.

Core principles:

* Users are assigned roles.
* Roles contain permissions.
* Roles are scoped per company (tenant).
* Authorization decisions are tenant-aware.

---

## Key Concepts

### User

Represents an authenticated identity.

A user may:

* Belong to one company
* Or belong to multiple companies (future support)

---

### Company (Tenant)

Defines the isolation boundary.

Authorization decisions must always consider:

```id="u82kdi"
user + company_id + role
```

---

### Role

Represents a collection of permissions.

Examples:

* Owner
* Admin
* Manager
* Operator
* Viewer

Roles are tenant-specific.

Two different companies may define roles with similar names but they are isolated.

---

### Permission

Represents a granular action.

Examples:

* orders.create
* orders.read
* orders.update
* vehicles.manage
* catalog.edit
* users.invite

Permissions are system-defined and global.

Roles map to permissions.

---

## Authorization Scope

Authorization must enforce:

1. Tenant Isolation
   Users cannot access data from another company.

2. Role Validation
   Users can only perform actions granted by their role.

3. Resource Ownership
   Access must match company_id of resource.

---

## Enforcement Strategy

Authorization must be enforced at:

* Application Layer
* Guard/Policy Layer (API layer)

Never rely on frontend validation.

---

## Super Admin (System-Level Role)

The system may include a global role:

* Super Admin

Capabilities:

* Manage companies
* View system-level data

Super Admin must bypass tenant restrictions intentionally and explicitly.

This role must not be mixed with tenant roles.

---

## Role Assignment Rules

* A user must have at least one role per company.
* Role assignment must be auditable.
* Role modification must require elevated permissions.

---

## Default Role Policy

When a company is created:

* Owner role is automatically assigned to creator.
* Default roles may be pre-seeded.

---

## Forbidden Practices

The following are strictly prohibited:

* Hardcoded role checks inside business logic.
* Role name string comparisons in domain logic.
* Authorization logic inside controllers.
* Bypassing tenant scoping for convenience.

---

## Future Evolution

The authorization model may evolve to include:

* Attribute-Based Access Control (ABAC)
* Resource-level permissions
* Policy engine integration

Any change must update this document.

---

## Summary

Arsan uses:

* Tenant-scoped RBAC
* Role-to-permission mapping
* Strict tenant isolation

Authorization must always consider:

* Identity
* Role
* Tenant context

Violations of these rules are considered critical security issues.
