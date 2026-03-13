SYSTEM_AUTHORIZATION.md

Authoritative Authorization Model (Architecture-Frozen)

1. PURPOSE

This document defines the authoritative authorization model.

It governs:

Tenant-scoped access control

Role and permission enforcement

Lifecycle-aware access validation

Financial operation restrictions

Super Admin boundaries

Domain-layer enforcement rules

Authorization context propagation

Command-level permission validation

If conflict exists:

SYSTEM_INVARIANTS.md prevails.

Authorization violations are critical security failures.

2. AUTHORIZATION MODEL

Arsan implements Tenant-Scoped Role-Based Access Control (RBAC).

Authorization decision must evaluate:

(user_id,
 company_id,
 permission,
 resource_owner_company_id,
 lifecycle_state)

Authorization must validate five dimensions:

Identity — authenticated user

Tenant Context — company scope

Permission — action authorization

Resource Ownership — tenant ownership

Lifecycle State — domain lifecycle rules

Authorization decisions must be deterministic.

3. AUTHORIZATION CONTEXT

Every request must establish an Authorization Context.

Authorization context includes:

user_id
company_id
roles[]
permissions[]
is_super_admin

This context must be propagated through:

API Layer
Command Handler
Domain Layer
Process Manager

Authorization context must be immutable during request execution.

4. TENANT ISOLATION ENFORCEMENT

Tenant validation MUST occur before any resource access.

Rules:

All resource queries must include company_id filter.

Resource ownership must match tenant context.

Cross-tenant access is forbidden.

Authorization must fail before data retrieval.

Forbidden pattern:

Fetch resource → then validate tenant

Required pattern:

Validate tenant → fetch resource

Tenant isolation violations are critical security failures.

5. ROLE & PERMISSION MODEL

Roles are tenant-scoped.

Roles assign permissions, but domain logic must rely only on permissions.

Example permissions:

orders.create
orders.read
orders.accept
orders.prepare
orders.ready
orders.cancel

offers.submit
offers.select

financial.register_cash
financial.register_debt
financial.register_payment

ownership.transfer.request
ownership.transfer.accept

catalog.edit
users.manage

Rules:

Permission registry must be global.

Permissions must be version-controlled.

Domain logic must NOT check role names.

Only permissions may be used for authorization decisions.

6. PERMISSION RESOLUTION

Permission resolution occurs during authentication.

Flow:

Authenticate User
→ Load user_company_roles
→ Resolve permissions
→ Build Authorization Context
→ Attach to request

Resolved permissions must remain constant during request lifecycle.

Dynamic permission mutation during execution is forbidden.

7. COMMAND AUTHORIZATION

All commands must validate authorization before execution.

Command authorization requires:

Permission Check
Tenant Validation
Lifecycle Validation
Resource Ownership Validation

Command execution is forbidden without successful authorization.

Authorization must occur before aggregate loading when possible.

8. DOMAIN-LAYER ENFORCEMENT

Authorization must be enforced at two levels:

API Layer

Responsible for:

Basic permission validation

Request blocking

Early rejection

Domain Layer

Responsible for:

Lifecycle-aware authorization

Resource ownership validation

Cross-aggregate security validation

Domain commands must enforce authorization.

Authorization must never exist only in controllers.

9. LIFECYCLE-AWARE AUTHORIZATION

Permissions alone are insufficient.

Authorization must validate lifecycle state constraints.

Examples:

orders.cancel allowed only before PREPARING

financial.register_debt allowed only after ORDER_RECEIVED

financial.register_payment allowed only when outstanding_balance > 0

ownership.transfer.accept forbidden after ORDER_COMPLETED

Lifecycle validation must align with:

SYSTEM_STATE_MACHINE_MATRIX.md

Lifecycle violations must raise domain errors.

10. FINANCIAL AUTHORIZATION RULES

Financial operations require strict enforcement.

Rules:

Financial operations forbidden before ORDER_RECEIVED.

Financial operations forbidden after ORDER_COMPLETED.

Payments must not exceed outstanding balance.

Ledger immutability must never be bypassed.

Financial commands must validate:

Permission
Lifecycle state
Outstanding balance
Order ownership

Super Admin cannot bypass financial invariants.

11. RESOURCE OWNERSHIP VALIDATION

Authorization must validate resource ownership.

Rule:

resource.company_id == current tenant context

Ownership transfer rules:

Transfer request → current owner company
Transfer acceptance → target company

Ownership change must occur via events.

Direct ownership mutation is forbidden.

12. PROCESS MANAGER AUTHORIZATION

Process Managers must execute commands with authorization context.

Saga execution rules:

Saga must not bypass permission validation.

Saga commands must include system actor identity.

Saga must respect lifecycle constraints.

Process Managers must never execute privileged operations silently.

13. IDEMPOTENCY & AUTHORIZATION

Idempotent commands must revalidate authorization on retry.

Rules:

Permission must be validated again.

Role changes must affect retry attempts.

Idempotency must prevent duplicate events.

Idempotency must not bypass authorization.

14. SUPER ADMIN MODEL

Super Admin is a system-level role.

Capabilities:

View cross-tenant data

Manage companies

Manage user assignments

Super Admin restrictions:

Super Admin cannot bypass:

Event immutability
Financial ledger immutability
Order lifecycle rules
Tenant isolation boundaries
State machine transitions

Super Admin privileges are observational and administrative, not domain-mutating.

All Super Admin actions must be fully logged.

15. AUTHORIZATION CACHING RULES

Authorization results may be cached for performance.

Cache rules:

Cache must be tenant-aware.

Cache must invalidate on role changes.

Cache must not persist beyond request lifecycle.

Permission cache must not bypass lifecycle validation.

16. AUTHORIZATION AUDIT LOGGING

Sensitive authorization decisions must be logged.

Logged actions include:

Financial operations
Ownership transfers
Role modifications
Super Admin actions

Audit logs must include:

user_id
company_id
action
resource_id
timestamp
result

Audit logs must be immutable.

17. FORBIDDEN PRACTICES

The system strictly forbids:

Hardcoded role checks

Authorization in frontend only

Tenant bypass queries

Lifecycle rule bypass

Mixing Super Admin and tenant roles

Permission checks inside repository layer

Fetching resource before tenant validation

Bypassing domain authorization

Violations are critical security failures.

18. FUTURE EXTENSIBILITY

Future authorization extensions may include:

Attribute-Based Access Control (ABAC)
Policy-based authorization
Resource-level access policies
External policy engines

Any extension must preserve:

Tenant isolation

Lifecycle enforcement

Financial integrity

Deterministic authorization behavior

FINAL AUTHORIZATION GUARANTEE

This authorization model guarantees:

Strict tenant isolation

Permission-based enforcement

Lifecycle-aware authorization

Financial protection

Immutable event safety

Domain-level authorization validation

Safe Super Admin containment

Deterministic access control

Authorization enforcement is mandatory at every command boundary.

Any violation is a critical system security failure.
