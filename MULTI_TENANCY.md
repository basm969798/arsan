# Multi-Tenancy Strategy

## Overview

This document defines the official multi-tenancy architecture for the Arsan platform.

Arsan is designed as a multi-tenant SaaS system where multiple companies (tenants) share the same infrastructure while maintaining strict data isolation.

This document is the single source of truth for tenant isolation rules.

---

## Architecture Decision

### Selected Strategy

**Shared Database — Shared Schema with Tenant Identifier**

All tenants share:

* Same database
* Same schema

Tenant isolation is enforced using:

```
company_id (tenant_id)
```

as a mandatory column for tenant-owned data.

---

## Rationale

This approach was selected because:

* Simpler operational complexity
* Lower infrastructure cost
* Easier migrations
* Faster development velocity
* Suitable for early and mid-scale SaaS

---

## Trade-offs

Advantages:

* Easier deployment
* Single migration pipeline
* Lower maintenance overhead

Risks:

* Risk of cross-tenant data leakage if filters are missed
* Increased responsibility on application-level isolation

Mitigation:

* Strict architectural rules (see Architecture Rules)
* Mandatory tenant filters
* Repository-level enforcement

---

## Tenant Identification

Tenant (company) is identified via:

* Authenticated JWT token
* Extracted from request context

Example:

```
request.user.company_id
```

Controllers must NOT manually determine tenant identity.

Tenant context must be provided by authentication middleware/guard.

---

## Data Isolation Rules

### Mandatory Rules

1. Every tenant-owned entity MUST include:

```
company_id
```

2. Every database query MUST include tenant filtering.

3. Cross-tenant access is strictly forbidden unless explicitly allowed.

4. Repository layer is responsible for enforcing tenant scoping.

---

## Global Data

Some entities may be global (non-tenant-specific).

Examples:

* system configuration
* predefined categories

Global tables:

* MUST NOT contain company_id
* MUST be explicitly documented

---

## Repository Enforcement

Tenant filtering must be implemented at repository level, not controller level.

Example concept:

* BaseRepository automatically injects company_id filters.

Purpose:

* Prevent human error
* Ensure consistent isolation

---

## Forbidden Practices

The following are NOT allowed:

* Queries without tenant filter
* Passing company_id manually from controller input
* Direct database access bypassing repositories

---

## Future Evolution

Possible future strategies:

* Schema-per-tenant
* Database-per-tenant

Migration path should be evaluated if:

* Enterprise clients require strong isolation
* Scaling constraints emerge

---

## Summary

Arsan uses a shared database multi-tenant architecture with strict company_id isolation rules.

Tenant safety depends on consistent enforcement of architectural constraints defined in this document.
