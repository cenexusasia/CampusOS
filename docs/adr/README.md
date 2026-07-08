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

# ADR-005: No Vector Database (Yet)

**Date:** 2026-07-08
**Status:** Accepted

## Context
RAG requires vector storage for semantic search. Options: pgvector, Pinecone, Qdrant, Weaviate.

## Decision
Start with PostgreSQL keyword search. Add pgvector when needed.

## Rationale
- Keyword search is sufficient for MVP Knowledge Base
- pgvector is available as Supabase extension (no new infra)
- Avoids complexity of separate vector database
- Can migrate to vector search without breaking API contract

## Consequences
- Search quality is limited to keyword matching
- No semantic understanding of queries
- Migration path: add `embedding` column to DocumentChunk, use pgvector

---

# ADR-006: Brownfield Over Greenfield

**Date:** 2026-07-08
**Status:** Accepted

## Context
Existing CampusOS codebase has 26 Prisma models, 11 NestJS modules, 10 frontend pages.

## Decision
Refactor and extend the existing codebase. Do NOT rewrite from scratch.

## Rationale
- ~6,000+ lines of working code (API + frontend + shared)
- Authentication, multi-tenant, and connectors already work
- Rewriting would take 2-3x longer than refactoring
- Existing architecture pattern is sound (modules, guards, Prisma)

## Consequences
- Need to gradually fix TypeScript errors
- Must maintain backward compatibility during refactoring
- Documentation must be updated to match actual code
