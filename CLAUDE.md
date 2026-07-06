# CampusOS — Project Context for Claude Code

## Project Overview

CampusOS is an AI Operating System for educational institutions. It integrates with existing LMS, SIS, HRIS, and ERP systems to provide unified dashboards, AI orchestration, workflow automation, and modern portals.

## Repository Structure

```
CampusOS/                     # Monorepo root
├── apps/
│   ├── web/                  # Next.js 15 (App Router) frontend
│   └── api/                  # NestJS backend API
├── packages/
│   ├── shared/               # Shared types, Zod schemas, utilities
│   ├── connector-sdk/        # Connector SDK for third-party integrations
│   └── ui/                   # Shared UI component library
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
├── docs/                     # All project documentation
├── .github/workflows/        # CI/CD pipelines
└── scripts/                  # Dev and setup scripts
```

## Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion
- **Backend:** NestJS, Prisma (ORM), PostgreSQL 16 + pgvector, Redis 7, BullMQ
- **Auth:** Auth.js v5 with Prisma adapter (OAuth2, OIDC, SAML, MFA)
- **AI:** Vercel AI SDK (multi-provider: OpenAI, Anthropic, Google, OpenRouter)
- **Infrastructure:** Docker Compose (dev), Kubernetes-ready (prod)
- **Package manager:** pnpm with Turborepo

## Key Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript type checking
pnpm test             # Run all tests
pnpm format           # Format code with Prettier
docker compose up     # Start all infrastructure services
```

## Development Conventions

### Code Style
- **TypeScript:** Strict mode, explicit return types on public functions
- **Naming:** camelCase for variables/functions, PascalCase for types/classes, kebab-case for files
- **Imports:** Use path aliases (`@web/`, `@api/`, `@shared/`, `@ui/`)
- **Formatting:** Prettier with 100 print width, single quotes, trailing commas
- **Components:** React functional components with TypeScript, named exports

### NestJS Convention
- Feature modules in `apps/api/src/modules/<module-name>/`
- Each module has: `module.ts`, `service.ts`, `controller.ts`, `dto/`, `interfaces/`
- Decorators for validation, auth, permissions
- OpenAPI decorators for API documentation

### Next.js Convention
- App Router with route groups: `(auth)`, `(portal)`, `(admin)`
- Server components by default, client components only when needed (`use client`)
- API routes in `app/api/` act as BFF (Backend-for-Frontend)
- React Server Components for data fetching where possible

### Testing
- Vitest for unit/integration tests
- Playwright for E2E tests
- Test files co-located with source files: `*.test.ts`, `*.spec.ts`
- Minimum 80% coverage on new code

### Git Workflow
- Feature branches from `main`
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- PRs require passing CI (lint, typecheck, test, build)

## Architecture Principles

1. **Multi-tenant by default** — every service must be tenant-aware
2. **API-first** — all functionality exposed via REST API before UI
3. **Modular isolation** — modules communicate through interfaces, not direct imports
4. **Connector-first** — external system data is treated as cache; source systems are truth
5. **Event-driven** — integration workflows use async event processing
6. **Fail gracefully** — circuit breakers, retries, fallbacks on external dependencies
7. **Audit everything** — all data mutations must be audited

## Important Files

- `/docs/PRD.md` — Product requirements
- `/docs/Architecture.md` — System architecture
- `/docs/Database.md` — Database schema design
- `/docs/API.md` — API specification
- `/docs/Sprints.md` — Sprint backlog
- `/docs/Tasks.md` — Task breakdown with status
- `/docs/Decisions.md` — Architecture Decision Records

## Current Phase

We are in **Phase 1: Scaffolding & Infrastructure**. The immediate priority is:
1. Initialize Turborepo monorepo
2. Scaffold Next.js 15 frontend
3. Scaffold NestJS backend
4. Set up Docker Compose infrastructure
5. Configure Prisma + first migration
6. Set up CI/CD

## Multi-Tenant Pattern

All API requests include:
- `Authorization: Bearer <jwt>` — user JWT
- `X-Tenant-Id` header — tenant/school identifier

NestJS middleware resolves tenant context and attaches it to the request object.
Prisma middleware switches schema based on tenant context for schema-per-tenant tables.
Row-level tenant_id filtering is applied for shared tables.

## Quality Gates (Do NOT skip)

Before marking any work complete:
- [ ] Build succeeds (`pnpm build`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test`)
- [ ] No placeholder code, TODO comments, or console.log in completed modules
- [ ] Responsive on desktop/tablet/mobile (for UI work)
- [ ] Accessible (WCAG AA target for UI work)
- [ ] Clean TypeScript with proper types (no `any`)
- [ ] Reusable components extracted where appropriate
