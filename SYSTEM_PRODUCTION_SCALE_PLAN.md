# SYSTEM_PRODUCTION_SCALE_PLAN.md
Production Strategy (Architecture-Frozen)

------------------------------------------------------------

1. PRODUCTION PRINCIPLES

Production must preserve:

- Event immutability
- Financial immutability
- Tenant isolation
- Aggregate boundaries
- Deterministic replay
- Strict authorization enforcement

No operational shortcut may violate invariants.

------------------------------------------------------------

2. INFRASTRUCTURE OVERVIEW

Stack:

- Ubuntu 22.04 LTS
- Docker
- Docker Compose
- Nginx Proxy Manager (SSL termination)
- PostgreSQL
- Redis (cache only)

Database and Redis MUST NOT be publicly exposed.

------------------------------------------------------------

3. SECURITY HARDENING

Secrets:

- Stored in .env.production
- Never committed
- JWT_SECRET ≥ 32 random chars
- Rotate periodically

Containers:

- Prefer non-root user
- restart: unless-stopped
- No public DB ports

API:

- Helmet enabled
- Strict CORS whitelist
- Global validation
- Rate limiting
- No stack traces in production

------------------------------------------------------------

4. EVENT & LEDGER SAFETY

Production must guarantee:

- system_events append-only
- financial_events append-only
- No UPDATE or DELETE allowed
- Migrations must preserve history

Event replay:

- Allowed only in maintenance mode
- Must disable external integrations
- Must not emit side effects

------------------------------------------------------------

5. HEALTH CHECK STRATEGY

GET /health must verify:

- PostgreSQL connectivity
- Redis connectivity
- Event store write permission
- Financial ledger write permission
- Migration version consistency

------------------------------------------------------------

6. LOGGING STRATEGY

Log:

- requestId
- userId
- companyId
- aggregateId
- eventType
- aggregateVersion
- lifecycle transitions
- financial events

Never log secrets.

Structured logging mandatory.

------------------------------------------------------------

7. IDEMPOTENCY POLICY

Idempotency keys:

- Persisted in DB
- Redis may cache but not authoritative

Duplicate prevention must survive restart.

------------------------------------------------------------

8. DATABASE STRATEGY

Rules:

- company_id indexed
- Strict tenant filtering
- Migration-only schema changes
- No manual production edits
- No rewriting event or financial history

Connection pool monitored.

------------------------------------------------------------

9. BACKUP STRATEGY

Daily:

- Full PostgreSQL dump
- Includes:
  - system_events
  - financial_events
  - saga_instances
  - migration history

Retention:

- 7 daily
- 4 weekly
- 3 monthly

Test restore every 30 days.

Never restore partial history.

------------------------------------------------------------

10. SCALING STRATEGY

Phase 1:
- Query optimization
- Index tuning
- Cache optimization

Phase 2:
- Increase CPU
- Separate DB server

Phase 3:
- Horizontal backend scaling
- Load balancer
- Read replicas

Monitor:

- Optimistic locking conflicts
- Event write latency
- DB connection pool
- Redis memory

------------------------------------------------------------

11. ZERO DOWNTIME DEPLOYMENT

- Build new image
- Run health check
- Switch traffic
- Stop old container

Rollback:
Re-deploy previous image.

------------------------------------------------------------

12. PRE-LAUNCH CHECKLIST

- SSL valid
- Secrets configured
- Event store integrity verified
- Ledger immutability enforced
- Healthcheck validated
- Rate limiting active
- Backups tested
- NODE_ENV=production
- No debug logs

------------------------------------------------------------

FINAL PRODUCTION GUARANTEE

Production must preserve:

- Event immutability
- Financial immutability
- Tenant isolation
- Deterministic lifecycle
- Authorization discipline
- Replay safety
- Audit integrity

Production is discipline.
Never compromise invariants.
