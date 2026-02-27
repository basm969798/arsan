# SYSTEM_AUTHORIZATION.md
Authoritative Authorization Model (Architecture-Frozen)

------------------------------------------------------------

1. PURPOSE

This document defines the authoritative authorization model.

It governs:

- Tenant-scoped access control
- Role and permission enforcement
- Lifecycle-aware access validation
- Financial operation restrictions
- Super Admin boundaries
- Domain-layer enforcement rules

If conflict exists:
SYSTEM_INVARIANTS.md prevails.

Authorization violations are critical security failures.

------------------------------------------------------------

2. AUTHORIZATION MODEL

Arsan uses Tenant-Scoped Role-Based Access Control (RBAC).

Core model:

Authorization decision =
(user_id, company_id, permission, resource_owner_company_id, lifecycle_state)

Authorization MUST validate:

1. Identity (authenticated user)
2. Tenant context
3. Role-to-permission mapping
4. Resource ownership
5. Lifecycle state (when applicable)

All five dimensions are mandatory.

------------------------------------------------------------

3. TENANT ISOLATION ENFORCEMENT

Tenant validation MUST occur BEFORE data fetch.

Rules:

- Every resource query MUST include company_id filter.
- Resource.company_id MUST equal current tenant context.
- Cross-tenant access is forbidden.
- Authorization check must fail before returning data.

No "fetch then validate" pattern allowed.

------------------------------------------------------------

4. ROLE & PERMISSION MODEL

Roles:

- Assigned per company.
- Map to system-defined permissions.
- Role names MUST NOT be used in business logic.

Authorization MUST depend only on permissions,
never on role names.

Example permissions:

- orders.create
- orders.accept
- orders.prepare
- orders.cancel
- orders.read
- financial.register_cash
- financial.register_debt
- financial.register_payment
- ownership.transfer.request
- ownership.transfer.accept
- catalog.edit
- users.manage

Permission registry is global and version-controlled.

------------------------------------------------------------

5. DOMAIN-LAYER ENFORCEMENT

Authorization MUST be enforced at:

- API layer (guard/policy)
- Domain command layer

Domain commands MUST validate:

- Permission
- Tenant context
- Lifecycle state

No command may execute without authorization validation.

Hardcoded permission bypass inside domain logic is forbidden.

------------------------------------------------------------

6. LIFECYCLE-AWARE AUTHORIZATION

Permission alone is insufficient.

Authorization MUST also validate lifecycle state.

Examples:

- orders.cancel allowed only before PREPARING.
- financial.register_debt allowed only after RECEIVED.
- financial.register_payment allowed only if outstanding balance > 0.
- ownership.transfer.accept forbidden after COMPLETED.

Lifecycle validation MUST align with SYSTEM_STATE_MACHINE_MATRIX.md.

------------------------------------------------------------

7. FINANCIAL AUTHORIZATION RULES

Financial operations require strict validation.

Rules:

- Financial actions forbidden before ORDER_RECEIVED.
- Financial actions forbidden after ORDER_COMPLETED.
- Overpayment attempts must be rejected.
- Financial domain cannot mutate Order directly.

Super Admin cannot bypass:

- Financial immutability
- Ledger integrity
- Balance rules

------------------------------------------------------------

8. SUPER ADMIN MODEL

Super Admin is a system-level role.

Capabilities:

- View cross-tenant data
- Manage companies
- Manage user assignments

Super Admin limitations:

- Cannot modify immutable events.
- Cannot modify financial ledger entries.
- Cannot override lifecycle transitions.
- Cannot reopen completed orders.
- Cannot bypass invariants.

Super Admin bypass is limited to visibility and tenant access only.

------------------------------------------------------------

9. RESOURCE OWNERSHIP VALIDATION

Authorization MUST validate:

resource.company_id == current tenant context

For ownership transfer:

- Request must originate from current owner.
- Acceptance must be performed by target company.
- Ownership update must be event-driven.

Cross-aggregate mutation without Process Manager is forbidden.

------------------------------------------------------------

10. IDEMPOTENCY & AUTHORIZATION

Idempotent commands MUST revalidate authorization on retry.

Rules:

- Idempotency does NOT bypass permission checks.
- Role changes must affect future retries.
- Duplicate command execution forbidden even if authorized.

------------------------------------------------------------

11. ROLE ASSIGNMENT RULES

- User must have at least one role per company.
- Role assignment changes must be auditable.
- Role modification requires users.manage permission.
- Owner role automatically assigned at company creation.

Role assignments are tenant-scoped.

------------------------------------------------------------

12. FORBIDDEN PRACTICES

The system strictly forbids:

- Hardcoded role-name checks.
- Authorization inside frontend only.
- Bypassing tenant filter for convenience.
- Skipping lifecycle validation.
- Mixing Super Admin with tenant roles.
- Direct permission checks inside data layer.
- Fetching resource before tenant validation.

Violations are critical security issues.

------------------------------------------------------------

13. FUTURE EXTENSIBILITY

Future models may include:

- Attribute-Based Access Control (ABAC)
- Resource-level policies
- External policy engines

Any evolution must preserve:

- Tenant isolation
- Financial immutability
- Lifecycle enforcement
- Deterministic authorization logic

------------------------------------------------------------

FINAL AUTHORIZATION GUARANTEE

This authorization model guarantees:

- Strict tenant isolation
- Permission-based enforcement
- Lifecycle-aware access control
- Financial protection
- Immutable event safety
- Domain-layer validation
- Super Admin containment

Authorization is mandatory at every command boundary.
