# CampusOS — Sprint Plan (Updated 2026-07-06)

**CTO:** Hermes (Autonomous)  
**Implementation Agent:** Claude Code  
**Repository:** github.com/cenexusasia/CampusOS  
**Frontend:** https://campusos-nu.vercel.app  

---

## Current State Assessment

| Area | Status | Details |
|------|--------|---------|
| Monorepo scaffold | ✅ Done | Turborepo + pnpm, apps/web + apps/api + packages/shared + packages/ui |
| Next.js frontend | ✅ Done | App Router, Tailwind v4, shadcn/ui, Framer Motion, deployed to Vercel |
| NestJS backend | 🟡 Partial | Auth/Users/Tenants modules exist, builds via `nest build`. `tsc --noEmit` fails on experimental decorators |
| Prisma schema | ✅ Done | 20+ models, client generated |
| Docker Compose | 🟡 Untested | postgres+pgvector, redis, minio, mailpit — config exists, never run |
| CI/CD | ❌ Missing | No GitHub Actions workflows |
| Tests | ❌ Missing | No test infrastructure at all |
| Connector SDK | ❌ Missing | Referenced in workspace but directory doesn't exist |
| Seed data | ❌ Missing | seed.ts exists but never executed |

---

## Sprint 0: Platform Foundation (Current Sprint)

**Goal:** Working Docker Compose development environment with end-to-end verified build, lint, and database connectivity.

### Sprint 0 Tasks

| ID | Task | Est. | Deps |
|----|------|------|------|
| S0-01 | **Fix remaining `@api/` path aliases** — convert 7 files to relative imports | 30min | — |
| S0-02 | **Verify Docker Compose environment** — `docker compose up`, confirm postgres accepts connections, redis responds, minio reachable | 1h | S0-01 |
| S0-03 | **Run Prisma migration** — `prisma migrate dev` against local postgres, verify all 20+ models created | 30min | S0-02 |
| S0-04 | **Run seed script** — execute `prisma/seed.ts`, verify demo data populated | 30min | S0-03 |
| S0-05 | **Start API server** — `nest start --watch`, verify health endpoint returns 200 | 30min | S0-04 |
| S0-06 | **Create GitHub Actions CI** — `.github/workflows/ci.yml`: lint → typecheck → test → build on PR/push | 1h | S0-01 |
| S0-07 | **Set up Vitest test infrastructure** — vitest.config.ts, first smoke test (health endpoint), verify test runner works | 1h | S0-05 |
| S0-08 | **Verify full dev workflow** — `pnpm build` clean, `pnpm lint` passes, `pnpm typecheck` passes, all services running | 30min | S0-01–S0-07 |

**Definition of Done for Sprint 0:**
- [ ] `docker compose up` starts all services without errors
- [ ] Prisma migrations run cleanly against local PostgreSQL
- [ ] Seed script populates demo data
- [ ] `GET /api/v1/health` returns `{"status":"ok","version":"0.1.0"}`
- [ ] `pnpm build` succeeds (both web + api)
- [ ] `pnpm lint` passes
- [ ] GitHub Actions CI runs on push
- [ ] At least one test passes via Vitest

---

## Sprint 1: Auth & Multi-Tenancy (Next)

**Goal:** Complete the auth system (login, register, OAuth, JWT, RBAC) and tenant management with working frontend-backend connectivity.

### Sprint 1 Tasks

| ID | Task | Est. | Deps |
|----|------|------|------|
| S1-01 | **Backend: Complete Auth API** — fix remaining build errors, verify POST /auth/register, POST /auth/login, GET /auth/me return correct responses | 2h | S0-05 |
| S1-02 | **Backend: Tenant API** — verify full CRUD, user invitation, member management | 1h | S1-01 |
| S1-03 | **Backend: RBAC integration** — wire roles/permissions guards into auth flow, test access control | 1h | S1-01 |
| S1-04 | **Frontend: Auth pages** — registration page, forgot password, reset password | 2h | S0 |
| S1-05 | **Frontend: API client** — create `lib/api-client.ts` that calls NestJS API with JWT + tenant headers | 1h | S1-01 |
| S1-06 | **Frontend: Login flow** — wire login page to call API, store JWT, redirect to dashboard | 1.5h | S1-04, S1-05 |
| S1-07 | **E2E Smoke Test** — register user → create tenant → login → access dashboard | 1h | S1-01–S1-06 |

---

## Sprint 2: AI Orchestrator & Chat (Coming)

**Goal:** Multi-provider AI abstraction, RAG pipeline, and the AI Chat interface.

---

## Sprint 3: Integration Gateway & Connector SDK (Coming)

**Goal:** Connector framework, sync engine, first connector implementations.

---

## Sprint 4: Workflow Engine & Portals (Coming)

**Goal:** Visual workflow builder, all four portals (Admin, Faculty, Student, Parent).

---

## Sprint 5+: Analytics, Knowledge Base, Billing, Marketplace

---

## Backlog (Detailed Tasks)

See `/docs/Tasks.md` for the full 100+ task breakdown. This sprint plan supersedes the original 33-sprint plan with a more realistic phased approach based on current project state.
