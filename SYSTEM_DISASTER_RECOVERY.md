# Arsan — Official Disaster Recovery Plan (Final)

## 1. Purpose

This document defines the Disaster Recovery (DR) strategy for Arsan.

It ensures:

- Business continuity
- Data integrity
- Financial immutability preservation
- Event history protection
- Multi-tenant isolation safety
- Fast system restoration
- Controlled incident handling

Disaster recovery is mandatory for production readiness.

---

## 2. Disaster Recovery Objectives

### RTO — Recovery Time Objective
Maximum acceptable downtime:
≤ 2 hours

### RPO — Recovery Point Objective
Maximum acceptable data loss:
≤ 15 minutes

Financial and event data must not be corrupted.

---

## 3. Disaster Scenarios Covered

The plan covers:

1. Server crash
2. Database corruption
3. Accidental data deletion
4. Container misconfiguration
5. Region-wide outage
6. Network failure
7. Storage disk failure
8. Security breach containment

---

## 4. System Components to Protect

Critical components:

- PostgreSQL database
- system_events table
- financial_events table
- Docker images
- Environment configuration
- SSL certificates
- Nginx configuration
- Redis configuration (non-authoritative)

Redis is not a source of truth.
Database is authoritative.

---

## 5. Backup Strategy

### 5.1 PostgreSQL Backup

Daily full backup:
- pg_dump
- Stored outside Docker containers
- Stored on separate volume
- Encrypted

Retention policy:
- 7 daily backups
- 4 weekly backups
- 3 monthly backups

Backup must include:
- All schemas
- system_events
- financial_events
- All tenant data

---

### 5.2 Redis Backup

Redis used for:
- Cache
- Idempotency keys
- Temporary locks

Redis data does NOT require full restoration.
Can be rebuilt safely.

---

### 5.3 Configuration Backup

Backup includes:

- docker-compose.yml
- .env.production
- Nginx SSL configs
- CI/CD scripts

Secrets must be stored securely and separately.

---

## 6. Backup Storage Rules

Backups must:

- Be encrypted at rest
- Be stored off-server
- Not be publicly accessible
- Be tested monthly

Access must be restricted to authorized admins only.

---

## 7. Recovery Procedures

### 7.1 Server Crash Recovery

Steps:

1. Provision new Ubuntu 22.04 server
2. Install Docker & Docker Compose
3. Restore docker-compose.yml
4. Restore environment variables
5. Restore PostgreSQL from latest backup
6. Start containers
7. Verify health endpoints
8. Validate tenant isolation
9. Validate financial integrity

---

### 7.2 Database Corruption Recovery

Steps:

1. Stop backend container
2. Restore database from latest valid backup
3. Verify integrity of:
   - orders
   - financial_events
   - system_events
4. Restart backend
5. Validate projections

---

### 7.3 Region Failure (Major Outage)

If primary region unavailable:

1. Deploy system in secondary region
2. Restore latest offsite backup
3. Update DNS records
4. Validate SSL
5. Verify health
6. Monitor traffic

Downtime target ≤ RTO.

---

## 8. Financial Integrity Validation

After restoration, must verify:

- No duplicate financial_events
- No missing financial_events
- Balance recomputation equals stored projections
- No negative balances
- No completed order without financial closure

Run reconciliation script post-recovery.

---

## 9. Event Store Integrity Validation

After restoration:

- Ensure event ordering intact
- No version gaps
- No duplicate aggregate version
- Projection rebuild test must pass

Event replay must produce consistent state.

---

## 10. Security Incident Containment

If breach suspected:

1. Immediately rotate JWT_SECRET
2. Rotate database credentials
3. Rotate Redis credentials
4. Invalidate all active tokens
5. Review audit logs
6. Isolate affected tenants if required

Never modify financial history.

---

## 11. Deployment Rollback Strategy

If deployment failure occurs:

1. Stop new container
2. Restart previous stable image
3. Verify health
4. Confirm DB schema compatibility
5. Monitor logs

Blue-Green or Rolling restart recommended.

---

## 12. Monitoring During Recovery

Must monitor:

- CPU usage
- Memory usage
- DB connection count
- Error rate
- API latency
- Failed login attempts

System must remain stable before reopening public access.

---

## 13. Recovery Testing Policy

Disaster recovery must be tested:

- Every 30 days (restore test)
- After major schema changes
- After infrastructure migration

Test must confirm:

- Data restoration success
- Financial integrity
- Event replay integrity
- Tenant isolation preserved

---

## 14. What Must Never Be Done

Never:

- Manually edit financial_events
- Rewrite system_events
- Modify balances directly
- Skip integrity checks
- Restore partial event logs
- Ignore version mismatches

Financial and event data are immutable.

---

## 15. Communication Plan

During major outage:

1. Notify internal team immediately
2. Log incident start time
3. Communicate estimated recovery time
4. Confirm recovery
5. Document incident report

Post-incident review required.

---

## Final Disaster Recovery Guarantee

This Disaster Recovery Plan guarantees:

- Business continuity
- Financial immutability preservation
- Event history integrity
- Multi-tenant isolation safety
- Controlled rollback
- Secure restoration
- Predictable recovery time
- Production-grade resilience

Disaster recovery discipline is mandatory for production trust.
