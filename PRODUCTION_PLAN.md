# 🚀 Arsan — Production & Scale Plan

This document defines the full production strategy for Arsan.

This is NOT for early development.
This plan is activated before public launch.

---

# 🧱 1️⃣ Infrastructure Overview

Production stack:

- Ubuntu 22.04 LTS
- Docker
- Docker Compose
- Nginx Proxy Manager (SSL)
- PostgreSQL
- Redis

Architecture:

Internet
   ↓
Nginx Proxy Manager (SSL termination)
   ↓
Frontend (NextJS)
   ↓
Backend API (NestJS)
   ↓
PostgreSQL + Redis

---

# 🔐 2️⃣ Security Hardening

## Environment Protection

- All secrets stored in `.env.production`
- NEVER commit secrets to GitHub
- Use strong JWT_SECRET (32+ chars random)
- Disable default database passwords

## Container Security

- Use alpine images
- Do not expose database ports publicly
- Backend and DB connected only via Docker network
- Use `restart: unless-stopped`

## API Security

- Enable CORS whitelist
- Enable Helmet in NestJS
- Enable rate limiting
- Validate all DTOs
- Use class-validator globally

---

# 📦 3️⃣ CI/CD Strategy

Trigger: Push to main branch

Pipeline:

1) Install dependencies
2) Run lint
3) Run tests
4) Build Docker images
5) Deploy via SSH to server
6) Restart containers

Tools:

- GitHub Actions
- Docker registry (optional)

Deployment model:

Blue-Green or Rolling restart via Docker.

---

# 📊 4️⃣ Monitoring Strategy

Initial Phase (Lightweight):

- Docker container healthcheck
- Basic logs inspection
- Portainer monitoring

Growth Phase:

- Prometheus
- Grafana dashboards
- Uptime monitoring (external)

Metrics to track:

- API response time
- Error rate
- Memory usage
- CPU usage
- Redis memory
- DB connections

---

# 🧾 5️⃣ Logging Strategy

Logging levels:

- ERROR
- WARN
- LOG
- DEBUG (disabled in production)

Rules:

- Log all state transitions
- Log all financial operations
- Log authentication failures
- Log multi-tenant context resolution

Store logs:

- Console (Docker logs)
- Later: Centralized logging system

Never log:

- Passwords
- JWT tokens
- Secrets

---

# ⚡ 6️⃣ Caching Strategy (Redis)

Redis used for:

- Search caching
- Rate limiting
- Idempotency keys
- Session caching
- Temporary locks

Rules:

- Cache only read-heavy endpoints
- Use TTL
- Never cache financial final states

---

# 🚦 7️⃣ Rate Limiting

Apply rate limiting on:

- Login endpoints
- Order creation
- Public APIs

Strategy:

- 100 requests / minute per IP (initial)
- Adjustable later

---

# 🗄️ 8️⃣ Database Strategy

## Indexing Plan

Indexes required for:

- company_id
- user_id
- order_id
- order_status
- created_at
- vehicle references

Multi-tenant rule:

All core tables must include:

company_id (indexed)

## Migrations

Use:

- TypeORM / Prisma migration system
- Never modify production DB manually

---

# 💾 9️⃣ Backup Strategy

Daily backup:

- PostgreSQL dump (automated)
- Store backup outside container

Backup retention:

- 7 daily
- 4 weekly
- 3 monthly

Test restore every 30 days.

---

# 📈 🔟 Scaling Strategy

Initial capacity (2 CPU / 8GB RAM):

Supports:

- 300–500 active users
- Moderate search load

Scaling plan:

Phase 1:
- Optimize queries
- Add indexes
- Improve caching

Phase 2:
- Separate database server
- Increase CPU to 4 cores

Phase 3:
- Horizontal scaling (multiple backend instances)
- Add load balancer

---

# 🧠 1️⃣1️⃣ Multi-Tenant Isolation Strategy

Golden rule:

Backend enforces tenant isolation at repository level.

Never rely on frontend filtering.

Every query must include:

WHERE company_id = currentTenant

Future improvement:

Row Level Security (PostgreSQL)

---

# 🔄 1️⃣2️⃣ Zero Downtime Deployment

Deployment steps:

1) Build new container
2) Run healthcheck
3) Switch traffic
4) Stop old container

Rollback plan:

- Keep previous image
- Re-deploy previous version

---

# 🧪 1️⃣3️⃣ Testing Strategy

Required before launch:

- Unit tests for core modules
- Integration tests for Orders
- Authentication tests
- Multi-tenant isolation tests

---

# 🔥 1️⃣4️⃣ Pre-Launch Checklist

- All environment variables set
- SSL valid
- Database backup working
- Healthcheck endpoint active
- Rate limiting active
- Logging level set to production
- No DEBUG logs
- No TODO left in code

---

# 🏁 FINAL PRODUCTION GOAL

Arsan must be:

- Secure
- Isolated per tenant
- Resilient
- Recoverable
- Scalable
- Observable
- Maintainable

Production is not a feature.
Production is architecture discipline.
