# ADR-001: Monorepo with pnpm Workspaces

**Date:** 2026-07-08
**Status:** Accepted

## Context
CampusOS has multiple packages (web, api, shared, ui) that need shared types, consistent versioning, and fast builds.

## Decision
Use pnpm workspaces with Turborepo for monorepo management.

## Rationale
- Single lockfile avoids dependency version conflicts
- Workspace protocol (`@campusos/shared`) enables clean imports
- Turborepo provides parallel builds and caching
- pnpm is significantly faster than npm/yarn for monorepos

## Consequences
- Railway deploy must use npm (from deploy dir), not pnpm (monorepo)
- All shared code goes in `packages/`

---

# ADR-002: API as Container, Not Serverless

**Date:** 2026-07-08
**Status:** Accepted

## Context
NestJS has long-running processes, WebSocket support, and database connection pooling.

## Decision
Deploy API as a container to Railway (or any Docker host). Not serverless (Vercel Functions).

## Rationale
- NestJS requires persistent process (not cold-start friendly)
- Background jobs, WebSockets need long-lived connections
- Prisma connection pool is more efficient in persistent process
- Railway provides easy container deployment with env var management

## Consequences
- Higher baseline cost than serverless
- Need container health checks and restart policies
- Railway project config must point to deploy directory

---

# ADR-003: Direct Database Connectors (Not REST API)

**Date:** 2026-07-08
**Status:** Accepted

## Context
Moodle and OpenSIS have REST APIs that are incomplete, slow, and version-dependent.

## Decision
Primary data sync uses direct MySQL queries to the source database. REST API as fallback.

## Rationale
- MySQL direct access provides complete data (not limited API endpoints)
- Much faster for bulk sync (batch queries vs. paginated REST)
- No authentication token management for each connector
- Moodle/OpenSIS run locally behind Cloudflare Tunnel

## Consequences
- Connector requires MySQL credentials (stored in Railway env vars)
- Not suitable for cloud-hosted LMS instances
- Database schema changes in source system may break connector

---

# ADR-004: DeepSeek as Default AI Provider

**Date:** 2026-07-08
**Status:** Accepted

## Context
Need cost-effective, fast AI for education sector. Multi-provider abstraction for flexibility.

## Decision
DeepSeek as primary AI provider. OpenAI, Anthropic, Google, OpenRouter as fallback options. Provider abstraction layer in `AIService`.

## Rationale
- DeepSeek is ~10x cheaper than GPT-4
- Response time is competitive (<2s first token)
- Quality is sufficient for education use cases
- Provider abstraction allows switching without code changes
- Direct fetch API avoids SDK dependency issues

## Consequences
- DeepSeek API key must be in environment variables
- Provider management UI is a planned feature
- Different providers have different model names and token limits

---

# ADR-005: pgvector for Semantic Search (Updated)

**Date:** 2026-07-08
**Status:** Updated — Now using pgvector

## Context
RAG requires vector storage for semantic search. Started with keyword search, now upgraded to vectors.

## Original Decision
Start with PostgreSQL keyword search. Add pgvector when needed.

## Updated Decision
pgvector deployed on Supabase. Document embeddings via DeepSeek embeddings API. Cosine similarity search with keyword fallback.

## Rationale
- pgvector is available as Supabase extension (no new infra)
- Vector search dramatically improves search quality
- DeepSeek embeddings are cost-effective ($0.07/1M tokens)
- Hybrid approach (vector + keyword) provides best results

## Consequences
- `embedding vector(1536)` column added to document_chunks table
- HNSW index on embedding column for fast similarity search
- Fallback to keyword search if embeddings API is unavailable
- Document uploads generate embeddings asynchronously

---

# ADR-006: Brownfield Over Greenfield

**Date:** 2026-07-08
**Status:** Accepted

## Context
Existing CampusOS codebase has 26 Prisma models, 11 NestJS modules, 10 frontend pages.

## Decision
Refactor and extend the existing codebase. Do NOT rewrite from scratch.

## Rationale
- ~10,000+ lines of working code across all modules
- Authentication, multi-tenant, and connectors already work
- Rewriting would take 2-3x longer than refactoring
- Existing architecture pattern is sound (modules, guards, Prisma)

## Consequences
- Must maintain backward compatibility during refactoring
- Documentation must be updated to match actual code

---

# ADR-007: BullMQ + Redis for Job Queues

**Date:** 2026-07-08
**Status:** Accepted

## Context
Connector sync operations, document processing, and future background jobs need async execution with retries.

## Decision
Use BullMQ on top of Redis for job queues. Graceful fallback when Redis unavailable.

## Rationale
- BullMQ provides job scheduling, retries, rate limiting out of the box
- Redis is already planned for caching — no new infrastructure
- Graceful fallback ensures app works without Redis
- @nestjs/bullmq integrates cleanly with existing module system

## Consequences
- Redis must be deployed for queue features to work
- Jobs survive process crashes (persisted in Redis)
- QueueModule is global — no per-module imports needed

---

# ADR-008: AI Agents as Synchronous Tool-Based System

**Date:** 2026-07-08
**Status:** Accepted

## Context
Users need AI to perform multi-step tasks across the platform (search, analyze, summarize, notify).

## Decision
Build synchronous AI Agents using DeepSeek for planning + execution. Each agent has access to 5+ tools (knowledge search, courses, students, notifications, analytics).

## Rationale
- Synchronous execution is simpler and sufficient for current use cases
- DeepSeek handles both planning and execution in one flow
- Tools are existing service methods — no new infra needed
- Future upgrade to BullMQ-backed async agents when needed

## Consequences
- Long-running agent tasks could timeout (future: async via BullMQ)
- Each tool must handle errors gracefully
- Agent responses are tenant-scoped (inherit user permissions)

---

# ADR-009: Deploy from apps/api/deploy/ with npm

**Date:** 2026-07-08
**Status:** Accepted

## Context
Railway Nixpacks builder doesn't support pnpm well. Monorepo root build fails due to pre-existing TypeScript decorator errors.

## Decision
Deploy API from pre-built `apps/api/deploy/` directory using npm. Dist files committed to git. No TypeScript compilation during build.

## Rationale
- Railway Nixpacks uses Node 20 + npm by default
- Pre-built dist avoids TS compilation errors on Railway
- npm is more compatible than pnpm for Railway's build system
- Separate package.json in deploy/ with only runtime dependencies

## Consequences
- Must copy `dist/` to `deploy/dist/` before each deploy
- Two package.json files to maintain (root pnpm + deploy npm)
- Railway build step is just `prisma generate` (no tsc)
