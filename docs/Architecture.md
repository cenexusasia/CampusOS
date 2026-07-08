# CampusOS — Architecture Document

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                     CAMPUSOS FRONTEND                          │
│         Next.js 15 + Tailwind + shadcn/ui (Vercel)             │
│  Dashboard  │  Students  │  Courses  │  AI Chat  │  Settings   │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTPS / JWT
┌──────────────────────────▼─────────────────────────────────────┐
│                      CAMPUSOS API                              │
│         NestJS + PostgreSQL + Redis (Railway/Docker)            │
│                                                                 │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │  Auth   │ │  Multi-  │ │    AI     │ │    Connectors    │  │
│  │  JWT    │ │  Tenant  │ │Orchestrator│ │  SDK Interface   │  │
│  └─────────┘ └──────────┘ └───────────┘ └──────────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │  RBAC   │ │  Audit   │ │Knowledge  │ │  Notifications   │  │
│  │         │ │  Logging │ │   Base    │ │  Email / In-app  │  │
│  └─────────┘ └──────────┘ └───────────┘ └──────────────────┘  │
└────────────────────────────────────────────────────────────────┘

CONNECTORS LAYER (satellite services)
┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│  Moodle  │ │  SIS     │ │ ERPNext│ │ Google │ │  Future  │
│  (MySQL) │ │ (MySQL)  │ │ (REST) │ │ (OAuth)│ │ Plugins  │
└──────────┘ └──────────┘ └────────┘ └────────┘ └──────────┘
```

## Technology Stack

### Frontend (Vercel)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.x | React framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component library |
| NextAuth.js | 4.x | Authentication |
| React | 19.x | UI library |

### Backend (Railway/Docker)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime |
| NestJS | 11.x | Framework |
| TypeScript | 5.x | Type safety |
| Prisma | 6.x | ORM |
| PostgreSQL | 16+ | Primary database |
| Redis | 7.x | Caching, sessions, queues |

### AI
| Technology | Purpose |
|-----------|---------|
| DeepSeek | Primary LLM provider |
| OpenAI | Fallback provider |
| @ai-sdk/xxx | Provider SDKs |
| Custom fetch | Direct API calls (DeepSeek) |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Supabase | PostgreSQL database |
| Cloudflare Tunnel | Local system access |

## Key Architecture Decisions

### ADR-001: Monorepo with pnpm Workspaces
**Context:** Multiple packages (web, api, shared, ui) need coordinated versioning.
**Decision:** Use pnpm workspaces with Turborepo.
**Rationale:** Shared types, single lockfile, parallel builds, workspace protocol.

### ADR-002: API as a Service, Not Serverless
**Context:** NestJS requires long-running processes.
**Decision:** Deploy API to Railway (container) or Docker host.
**Rationale:** WebSockets, background jobs, complex middleware, database connections.

### ADR-003: DeepSeek as Default AI Provider
**Context:** Need cost-effective, fast AI for education sector.
**Decision:** DeepSeek primary, multi-provider abstraction for fallback.
**Rationale:** Cost (10x cheaper than GPT-4), speed, competitive quality.

### ADR-004: Direct Database Connectors
**Context:** Moodle/OpenSIS have weak REST APIs.
**Decision:** Primary sync via direct MySQL queries.
**Rationale:** Reliability, data completeness, simplicity.

### ADR-005: No Vector Database (Yet)
**Context:** RAG requires vector storage.
**Decision:** Start with keyword search in PostgreSQL.
**Rationale:** Lower complexity, defer pgvector until search quality is insufficient.

## Security Architecture
- **Tenant Isolation:** Every query includes tenantId filter
- **Authentication:** JWT with access + refresh tokens
- **Authorization:** JWT guard on all protected routes
- **Secrets:** Railway environment variables (not in code)
- **Audit:** AuditLog model tracks all sensitive operations

## Deployment Architecture
```
┌─────────────────────────────┐
│  User Browser               │
│  → https://campusos-nu.app  │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  Vercel (Edge Network)      │
│  → Next.js SSR + ISR        │
│  → NextAuth.js sessions     │
└──────────────┬──────────────┘
               │ JWT Bearer
┌──────────────▼──────────────┐
│  Railway (Container)        │
│  → NestJS HTTP Server       │
│  → Prisma → Supabase PG     │
│  → fetch → DeepSeek API     │
└──────────────┬──────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌────▼───┐
│ Local  │          │ 3rd    │
│ Moodle │          │ Party  │
│ SIS    │ ←Tunnel→ │ APIs   │
│ MySQL  │          │        │
└────────┘          └────────┘
```

## Scalability
- **Horizontal scaling:** API is stateless (JWT, no server sessions)
- **Database:** Supabase can scale read replicas
- **Redis:** Future addition for caching, rate limiting, queues
- **CDN:** Vercel Edge Network for static assets + SSR
- **AI Rate Limiting:** Per-tenant token budgets (future)
