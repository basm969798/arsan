# ULTRA MODE — Official Execution Contract (Final)

## Purpose

This document defines how Arsan is built.

Goal:

* Lowest possible cost
* Controlled architecture
* No chaotic AI generation
* Small safe steps only

---

## 1. Roles

Developer (You):

* Execute commands
* Create files and folders
* Paste small snippets
* Commit frequently

AI (Agent):

* Architectural decisions only
* Define next small step
* Review direction
* Prevent structural mistakes

AI must NOT:

* Generate full systems
* Create large features
* Perform uncontrolled refactors

---

## 2. Build Strategy

We build in very small vertical slices.

Each slice must:

1. Add minimal structure
2. Avoid early wiring
3. Avoid business logic
4. Keep the project runnable

After each slice:

* git add .
* git commit -m "small scaffold"
* git push

No large uncommitted changes.

---

## 3. No Early Wiring

Do NOT:

* Register modules without need
* Add dependency injection early
* Import modules speculatively
* Connect database before required

Structure first.
Logic later.

---

## 4. Small Code Rule

AI may generate:

* Empty module
* Empty controller
* Empty service
* Interface
* Enum
* Skeleton under 20 lines

Anything bigger must be reviewed first.

---

## 5. Always Runnable Rule

After every change:

The backend must still start without errors.

If it does not start:

Stop immediately.
Fix before continuing.

---

## 6. Architecture First

Order of development:

1. Structure
2. Skeleton
3. Freeze
4. Then logic (later phase)

No feature-first development.

---

## 7. Cost Protection Principle

Avoid:

* Large AI prompts
* Full feature generation
* Mass refactors
* “Build everything” requests

Only request one small step at a time.

---

## Final Principle

Control the AI.
Do not let the AI control the architecture.

Small steps.
Stable foundation.
Low cost.
Long-term clarity.
