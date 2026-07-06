# Changelog

All notable changes to CampusOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-07-06

### Added

- **Project Kickoff:** Repository initialized with complete project structure
- **Planning Documents:**
  - PRD — Product Requirements Document with 18 core modules
  - System Architecture — Full architecture diagram with 5 layers
  - Database Design — 20+ entity models with multi-tenant strategy
  - API Specification — 80+ RESTful endpoints across 16 resource groups
  - Implementation Roadmap — 24-week phased delivery plan
  - Sprint Backlog — 33 sprints with detailed task breakdowns
  - Architecture Decision Records — 16 ADRs covering key technology choices
- **Quality Gates Defined:** Build, lint, type-check, test, security, accessibility
- **Connector Strategy:** 10 initial connectors with SDK pattern
- **Claude Code Context:** CLAUDE.md established for AI-assisted development

### Infrastructure (Sprint 1)

- Initialize Turborepo monorepo with pnpm workspaces
- Scaffold Next.js 15 frontend with App Router, TypeScript, Tailwind CSS v4
- Scaffold NestJS backend with Swagger, CORS, validation, health endpoint
- Create packages/shared with shared types, Zod schemas, constants
- Create packages/ui component library shell
- Docker Compose with PostgreSQL 16 + pgvector, Redis 7, MinIO, Mailpit
- Complete Prisma schema with 20+ models covering all core entities
- Prisma client generated, seed script ready
- Full build passes (api: nest build, web: next build)
- ESLint + Prettier configuration at root level

### Architecture Decisions

- Modular monolith with microservices-ready architecture (ADR-001)
- Hybrid multi-tenancy with schema + row-level isolation (ADR-002)
- pgvector over dedicated vector database (ADR-003)
- Auth.js over Keycloak for authentication (ADR-004)
- Prisma ORM for database access (ADR-005)
- BullMQ for job queues (ADR-006)
- Vercel AI SDK for streaming AI responses (ADR-007)
- Turborepo for monorepo management (ADR-008)
- Cursor-based pagination (ADR-009)
- SSE + WebSocket hybrid for real-time features (ADR-010)
- Three-tier RBAC model (ADR-011)
- Event-driven architecture for integrations (ADR-012)
- RESTful API with future GraphQL consideration (ADR-013)
- Tailwind CSS v4 + shadcn/ui for frontend (ADR-014)
- Connector SDK as separate npm package (ADR-015)
- External system data treated as cache (ADR-016)
