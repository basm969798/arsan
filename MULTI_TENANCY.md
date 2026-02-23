# Multi-Tenancy Strategy

## Overview

This document defines the official multi-tenancy architecture for the Arsan platform.

Arsan is a multi-tenant SaaS system where multiple companies (tenants) share the same infrastructure while maintaining strict data isolation.

This document is the single source of truth for tenant isolation rules.

---

## Architecture Decision

### Selected Strategy

Arsan uses:

**Shared Database — Shared Schema with Tenant Identifier**

All tenants share:

* Same database
* Same schema

Tenant isolation is enforced through a mandatory column:

```text
company_id
```

All tenant-owned entities must include this identifier.

---

## Rationale

This strategy was selected because:

* Simpler infrastructure management
* Faster development velocity
* Easier migrations and deployments
* Lower operational cost
* Suitable for early and mid-scale SaaS environments

---

## Trade-offs

### Advantages

* Single deployment pipeline
* Reduced infrastructure complexity
* Easier scaling during early stages

### Risks

* Cross-tenant data leakage if filtering is missed
* Strong reliance on application-level enforcement

### Mitigation

* Repository-level tenant enforcement
* Strict architectural rules
* Mandatory code review checks

---

## Tenant Identification

Tenant identity is derived from authenticated context.

Source of truth:

* JWT token

Example concept:

```text
request.user.company_id
```

Controllers must NOT manually determine tenant identity.

Tenant context must be injected by authentication middleware/guards.

---

## Data Ownership Rules

### Tenant-Owned Data

Rules:

1. Every tenant-owned entity MUST include:

```text
company_id
```

2. All queries MUST include tenant filtering.

3. Cross-tenant access is forbidden unless explicitly documented.

4. Tenant isolation must be enforced automatically where possible.

---

### Global Data

Some data may be global (non-tenant-specific).

Examples:

* System configuration
* Global categories
* Static reference data

Rules:

* Global entities MUST NOT include company_id.
* Global tables must be clearly documented.

---

## Enforcement Strategy (HOW)

Tenant filtering must be enforced at repository level.

Recommended approach:

* Implement a Base Repository pattern.
* Automatically inject company_id filtering into queries.

Goals:

* Prevent developer mistakes.
* Ensure consistent tenant isolation.
* Avoid relying on controller-level filtering.

Controllers must never manually apply tenant filters.

---

## Authorization Interaction

Authorization must always consider:

* user identity
* assigned role
* company_id (tenant context)

See AUTHORIZATION.md for role-based access model.

---

## Forbidden Practices

The following are strictly prohibited:

* Queries without tenant filtering.
* Passing company_id manually from client input.
* Direct database access bypassing repositories.
* Hardcoding tenant logic inside controllers.

---

## Future Evolution

Possible future migration paths:

* Schema-per-tenant model
* Database-per-tenant model

Migration may be required if:

* Enterprise isolation requirements increase
* Scaling limitations appear

---

## Summary

Arsan adopts a shared database multi-tenant architecture with strict company_id-based isolation.

Tenant safety depends on:

* Repository-level enforcement
* Clear architectural boundaries
* Consistent authorization checks

Violations of these rules are considered critical architectural and security issues.

