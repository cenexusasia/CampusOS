# CampusOS — Architecture Document

## System Overview

```
                         USER (Browser / Mobile)
                              │
                    ┌─────────▼─────────┐
                    │  Vercel (Edge)    │
                    │  Next.js 15       │
                    │  Tailwind/shadcn  │
                    │  NextAuth         │
                    └─────────┬─────────┘
                              │ HTTPS + JWT
                    ┌─────────▼──────────────────────────────┐
                    │         RAILWAY (Docker Container)       │
                    │             NestJS API Server            │
                    │                                          │
                    │  ┌──────────┐  ┌──────────────────┐      │
                    │  │  Auth    │  │  AI Orchestrator │      │
                    │  │  JWT     │  │  ┌────────────┐  │      │
                    │  │  Tenant  │  │  │ DeepSeek   │  │      │
                    │  │  RBAC    │  │  │ OpenAI     │  │      │
                    │  └──────────┘  │  │ Anthropic  │  │      │
                    │                │  │ Google     │  │      │
                    │  ┌──────────┐  │  └────────────┘  │      │
                    │  │ Connectors│  └──────────────────┘      │
                    │  │  SDK     │                            │
                    │  │  Moodle  │  ┌──────────────────┐      │
                    │  │  OpenSIS │  │  AI Agents       │      │
                    │  │  Google  │  │  Plan → Execute  │      │
                    │  │  (Ext.)  │  │  5 tool methods  │      │
                    │  └──────────┘  └──────────────────┘      │
                    │                                          │
                    │  ┌──────────┐  ┌──────────────────┐      │
                    │  │Knowledge │  │  BullMQ Queue    │      │
                    │  │  Base    │  │  (Redis)         │      │
                    │  │ pgvector │  │  Job scheduling  │      │
                    │  │ DeepSeek │  │  Async processing│      │
                    │  │ Embeddings│  └──────────────────┘      │
                    │  └──────────┘                            │
                    │  ┌──────────┐  ┌──────────────────┐      │
                    │  │  Courses │  │  Analytics       │      │
                    │  │  Students│  │  Real data       │      │
                    │  │  Faculty │  │  Charts/KPIs     │      │
                    │  │  Depts   │  └──────────────────┘      │
                    │  └──────────┘                            │
                    └────────────────┬─────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
     ┌────────▼──────┐    ┌─────────▼──────┐    ┌─────────▼──────┐
     │  Supabase PG  │    │  Redis         │    │  DeepSeek API  │
     │  26 models    │    │  BullMQ queues │    │  Chat + Embed  │
     │  pgvector     │    │  Cache (fut.)  │    │  (external)    │
     └───────────────┘    └────────────────┘    └────────────────┘

CONNECTORS (to existing enterprise systems)
┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐
│  Moodle  │  │ OpenSIS  │  │ Google │  │  ERPNext │  │  Future  │
│  (MySQL) │  │ (MySQL)  │  │(OAuth) │  │  (REST)  │  │ Plugins  │
└──────────┘  └──────────┘  └────────┘  └──────────┘  └──────────┘
     │              │            │
 Cloudflare Tunnel (local systems)
```

## Technology Stack

### Frontend (Vercel)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 | SSR, ISR, Edge |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS 4 + shadcn/ui | Component system |
| Auth | NextAuth.js 4 | JWT sessions |
| State | React 19 hooks + fetch | Data fetching |
| Icons | lucide-react | Icon library |

### Backend (Railway Container)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20+ | HTTP server |
| Framework | NestJS 11 | Module system, DI |
| ORM | Prisma 6 | PostgreSQL |
| Queue | BullMQ + Redis | Async jobs |
| Vector | pgvector | Semantic search |
| Search | Prisma contains + pgvector | Hybrid search |

### AI Layer
| Provider | Use | Status |
|----------|-----|--------|
| DeepSeek Chat | Primary AI chat | ✅ Live |
| DeepSeek Embeddings | Document vectors | ✅ Live |
| OpenAI | Chat fallback | 🔶 Configured |
| Anthropic | Chat fallback | 🔶 Configured |
| Google | Chat fallback | 🔶 Configured |

### Infrastructure
| Service | Hosting | Purpose |
|---------|---------|---------|
| Vercel | Edge Network | Frontend |
| Railway | Docker Container | Backend |
| Supabase | Cloud PostgreSQL | Database |
| Railway | Environment vars | Secrets |
| Cloudflare | Tunnel | Local systems |

## Module Architecture

```
API Root (/api/v1)
├── /health              → HealthModule
├── /auth/*              → AuthModule (JWT, register, login, refresh)
├── /users/*             → UsersModule
├── /tenants/*           → TenantsModule
├── /courses/*           → CoursesModule
├── /students/*          → StudentsModule
├── /ai/chat             → AIController (direct DeepSeek fetch)
├── /agents/execute      → AgentsModule (AI Agents framework)
├── /knowledge/*         → KnowledgeModule (upload, search, list, delete)
├── /connectors/*        → ConnectorsModule (list, connect, sync, disconnect)
├── /analytics/*         → AnalyticsModule (overview, enrollments, etc.)
├── /settings/*          → SettingsModule
└── /notifications/*     → NotificationsModule

Infrastructure Modules (Global)
├── PrismaModule         → Database access
├── ConfigModule         → Environment config
└── QueueModule          → BullMQ/Redis (global, graceful fallback)
```

## Key Architectural Patterns

### 1. Module Pattern
Every feature module follows the same structure:
```
module/
├── *.module.ts    — NestJS module, imports, providers, exports
├── *.controller.ts — Routes, guards, DTOs
├── *.service.ts   — Business logic, Prisma queries
└── dto/           — (optional) Request/response types
```

### 2. Auth Pattern
- @UseGuards(JwtAuthGuard) on all protected routes
- @CurrentUser() decorator extracts JWT payload
- tenantId comes from JWT, NEVER from request body
- Role-based access via @Roles() / @Permissions() decorators

### 3. Tenant Isolation Pattern
- Every Prisma query filters by tenantId
- TenantMiddleware is not used — tenantId from JWT is source of truth
- No cross-tenant data access possible at the service layer

### 4. AI Agent Pattern
```
User Goal → DeepSeek Plan → Sequential Tools → Summarized Result
                              ├── searchKnowledgeBase
                              ├── queryCourses
                              ├── queryStudents
                              ├── sendNotification
                              └── getAnalytics
```
Each tool is a method on AgentService. Results feed into next step. Final summary via DeepSeek.

### 5. Document Processing Pipeline
```
Upload → Save to disk → Extract text (PDF/DOCX/TXT/MD)
       → Chunk (1000 chars, 50 overlap) → Save DocumentChunks
       → Generate Embeddings (DeepSeek) → Store in pgvector
       → Status: READY
```
Search: vector similarity (pgvector cosine) → fallback to keyword (Prisma contains)

### 6. Queue Pattern (BullMQ)
```
Service → QueueService.addJob() → BullMQ → Redis → Worker
                                         ↓ Error
                                    Log warning, return null
```
Graceful degradation: if Redis unavailable, app continues without queue.

## Security Architecture
- **Auth:** JWT access (15min) + refresh (7d) tokens
- **Tenant Isolation:** tenantId from JWT, not user input
- **API Protection:** @UseGuards(JwtAuthGuard) on all routes
- **Secrets:** Railway env vars (DEEPSEEK_API_KEY, DATABASE_URL, JWT_SECRET)
- **Audit:** AuditLog model for sensitive operations
- **Rate Limiting:** Future (@nestjs/throttler)
- **AI Safety:** Agents inherit user permissions

## Scalability
| Dimension | Strategy | Status |
|-----------|----------|--------|
| API | Stateless (JWT), horizontal scaling | ✅ Ready |
| Database | Supabase read replicas | ✅ Available |
| Queue | BullMQ + Redis | ✅ Deployed |
| Search | pgvector HNSW indexes | ✅ Deployed |
| CDN | Vercel Edge | ✅ Live |
| Caching | Redis (future) | 📝 Planned |

## Architecture Decisions (Current)

| ADR | Decision | Status |
|-----|----------|--------|
| 001 | pnpm monorepo + Turborepo | ✅ Active |
| 002 | NestJS on Railway (container) | ✅ Active |
| 003 | DeepSeek as primary AI | ✅ Active |
| 004 | Direct MySQL connectors | ✅ Active |
| 005 | ~~No vector DB~~ → **pgvector adopted** | 🔄 Updated |
| 006 | Brownfield over greenfield | ✅ Active |
| 007 | BullMQ + Redis for job queues | ✅ Active |
| 008 | AI Agents (sync, tool-based) | ✅ Active |
| 009 | Deploy from apps/api/deploy/ (npm) | ✅ Active |
| 010 | Pre-built dist in git (no tsc on Railway) | ✅ Active |
