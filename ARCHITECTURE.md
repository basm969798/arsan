# Arsan - System Architecture

---

## ⭐ الفكرة الأساسية

- Frontend منفصل.
- Backend API منفصل (API-first).
- Database و Redis مستقلين.
- Backend هو المصدر الوحيد للحقيقة (Single Source of Truth).

---

## 🧱 المخطط العام للنظام

Users (Companies)

        |
        ▼

Nginx Proxy Manager (SSL + Routing)

        |
-------------------------------------------------
|                                               |
▼                                               ▼

Frontend (Next.js)                    Backend API (Node.js)
واجهة المستخدم                         منطق النظام الحقيقي

                |-------- API Requests --------|

                                |
                                ▼

                -----------------------------------
                PostgreSQL (arsan-db)
                Redis (arsan-redis)
                -----------------------------------

---

## 🎨 Frontend (Next.js)

- عرض الكتالوج.
- إدارة الطلبات.
- لوحة التحكم.
- لا يحتوي business logic ثقيل.
- يعتمد على Backend API فقط.

---

## 🧠 Backend API (Core System)

يحتوي:

- منطق العمل (Business Logic)
- إدارة الحالات (State Management)
- الأدوار والصلاحيات
- البحث
- الإشعارات
- API للشركاء مستقبلاً

أمثلة:

POST /api/orders
GET /api/catalog
POST /api/login

---

## 🗄️ Database (PostgreSQL)

يخزن:

- الشركات (Companies)
- المستخدمين (Users)
- السيارات (Vehicles)
- الطلبات (Orders)

---

## ⚡ Redis

يستخدم لـ:

- Cache
- Background Jobs
- Queues
- Notifications

---

## 🌐 Reverse Proxy (Nginx Proxy Manager)

- SSL
- Domain routing

Examples:

arsan.com → Frontend
api.arsan.com → Backend

---

## 🔌 API Communication Rules

- Frontend communicates with Backend via HTTP API only.
- No direct database access from frontend.
- Backend is the single source of truth.

---

## 🏢 Multi-tenant Design (B2B Core)

- System is company-based.
- Company is the root entity.
- All business data belongs to a company.
- company_id required for core entities.

---

## 🔄 State Ownership

- Backend manages all state transitions.
- Frontend cannot change business state directly.

---

## 📁 Repository Structure

arsan/

  backend/
    src/
    Dockerfile

  frontend/
    src/
    Dockerfile

  docker-compose.yml
