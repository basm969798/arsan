# SYSTEM_SAAS_PLATFORM_ARCHITECTURE.md

Authoritative SaaS Platform Architecture
Investment-Ready Edition

------------------------------------------------------------

1. PURPOSE

This document defines the SaaS platform layer of Arsan.

It governs:

- Identity & Authentication
- Company lifecycle
- Subscription management
- Billing abstraction
- Usage limits
- Background processing
- Notifications
- Platform administration

This layer sits ABOVE the business engine
(Order, Financial, Ownership).

All business operations are subject to SaaS rules.

------------------------------------------------------------

========================
CORE SAAS DOMAINS
========================

2. IDENTITY DOMAIN

2.1 Users

Represents an individual identity.

Users may:
- Belong to multiple companies
- Have different roles per company

2.2 Authentication

- JWT access tokens
- Refresh tokens (persisted)
- Session revocation support
- Token expiration enforcement

2.3 Security Requirements

Mandatory:

- Email verification flow
- Password reset flow
- Account lockout after failed attempts
- Refresh token rotation
- Session invalidation on password change

No plaintext password storage.
Passwords must be hashed securely.

------------------------------------------------------------

3. COMPANY DOMAIN

3.1 Company Entity

Represents a tenant.

Fields include:

- id
- name
- owner_user_id
- status (ACTIVE | SUSPENDED | TRIAL | EXPIRED)
- created_at

3.2 Company Status Enforcement

If status != ACTIVE:

- All business endpoints must be blocked.
- Only limited access allowed (billing/account pages).

Company suspension must immediately block API access.

------------------------------------------------------------

4. ROLE & PERMISSION SYSTEM

4.1 Role Model

Tenant-scoped RBAC.

A user may have:

- Different roles per company
- No global tenant bypass (except platform admin)

4.2 Platform Admin Role

Separate from tenant roles.

Platform admin can:

- Suspend company
- Change plan
- View metrics
- Override status (audited)

------------------------------------------------------------

5. PLAN & SUBSCRIPTION DOMAIN

5.1 Plan Model

Plans define:

- Price
- Billing cycle
- User limit
- Order limit
- Feature flags
- Storage limit

5.2 Subscription Model

Each company has:

- One active subscription
- Subscription status:
  - ACTIVE
  - TRIAL
  - PAST_DUE
  - CANCELLED
  - EXPIRED
  - GRACE_PERIOD

5.3 Trial Logic

Trial:

- Has start_date
- Has end_date
- Auto-transitions to EXPIRED if unpaid

------------------------------------------------------------

6. BILLING ABSTRACTION LAYER

6.1 Billing Design

Billing must be provider-agnostic.

Define:

PaymentProvider Interface:

- createCustomer()
- createSubscription()
- cancelSubscription()
- handleWebhook()

No provider logic inside domain.

6.2 Invoice Model

Invoices:

- id
- company_id
- subscription_id
- amount
- status (PENDING | PAID | FAILED)
- due_date

Invoices are immutable once issued.

6.3 Webhook Endpoint

Must:

- Validate signature
- Map provider event → subscription update
- Log audit event

No direct DB mutation outside application layer.

------------------------------------------------------------

7. USAGE & LIMIT ENFORCEMENT

7.1 Limit Types

- Max users per company
- Max orders per month
- Feature gating
- Storage limit

7.2 Enforcement Rules

Limits must be:

- Checked in Application layer
- Based on active subscription
- Deterministic
- Non-bypassable

Limit violation → 422 Business Rule Violation

------------------------------------------------------------

8. BACKGROUND PROCESSING

8.1 Required Jobs

- Trial expiration job
- Subscription expiration job
- Grace period expiration job
- Invoice reminder job
- Email notification queue

8.2 Scheduler

May use:

- Cron-based scheduler
- In-process job runner (initial phase)

Must NOT:

- Bypass domain rules
- Mutate financial ledger directly

------------------------------------------------------------

9. NOTIFICATION DOMAIN

9.1 Notification Types

- Email verification
- Password reset
- Subscription expiring
- Invoice issued
- Payment failed
- Order accepted
- Order ready
- Debt reminder

9.2 Email Queue

Email sending must be:

- Asynchronous
- Retryable
- Logged
- Auditable

No blocking API calls.

------------------------------------------------------------

10. PLATFORM ADMINISTRATION

Platform Admin can:

- View companies
- Suspend company
- Change plan
- Force cancel subscription
- View subscription status
- View usage metrics
- View audit logs

All admin actions must be logged.

------------------------------------------------------------

11. ENFORCEMENT ORDER

Before any business action:

System must validate:

1. Authentication
2. Tenant resolution
3. Company status
4. Subscription status
5. Usage limits
6. Role permissions
7. Domain invariants

Failure at any stage must stop execution.

------------------------------------------------------------

12. DEPENDENCY HIERARCHY

SaaS Layer
    ↓
Business Engine
    ↓
Financial Ledger

Business engine must never bypass SaaS checks.

------------------------------------------------------------

FINAL SAAS ARCHITECTURE STATEMENT

Arsan is a:

Multi-Tenant SaaS Platform
With:
- Secure Identity
- Subscription Engine
- Billing Abstraction
- Usage Enforcement
- Background Processing
- Notification System
- Platform Administration

The SaaS layer governs access to all business logic.

No business feature may operate
outside subscription and company validation.

Investment-ready architecture enforced.
