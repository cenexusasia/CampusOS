# CampusOS — System Architecture

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2026-07-06

---

## 1. Architecture Overview

CampusOS follows a **modular monolith with microservices-ready** architecture. All core modules live in a single NestJS application during initial development, but are organized as bounded contexts that can be extracted into independent microservices when scaling demands it.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Next.js  │  │  Mobile  │  │  3rd-Party│  │  Browser Ext.    │   │
│  │  Web App │  │  (Future)│  │  Clients  │  │  (Future)        │   │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└───────┼─────────────────────────────────────────────────────────────┘
        │ HTTPS / WSS
┌───────┼─────────────────────────────────────────────────────────────┐
│       ▼                       GATEWAY LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              NestJS API Gateway                              │    │
│  │  • Rate Limiting    • Auth Verification    • Routing         │    │
│  │  • Request Validation  • Response Caching  • Logging        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
        │
┌───────┼─────────────────────────────────────────────────────────────┐
│       ▼                     SERVICE LAYER                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Application Services                      │    │
│  │                                                             │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │
│  │  │Identity &│ │  Tenant  │ │    AI    │ │   AI Chat    │  │    │
│  │  │   SSO    │ │  Mgmt    │ │Orchestr. │ │              │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │
│  │  │Integ.    │ │Connector │ │ Workflow │ │ Notification │  │    │
│  │  │ Gateway  │ │   SDK    │ │  Engine  │ │              │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │
│  │  │Analytics │ │Knowledge │ │  Audit   │ │   Billing    │  │    │
│  │  │          │ │   Base   │ │   Logs   │ │              │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │
│  │  │    AI    │ │Provider  │ │  Agent   │ │  Prompt      │  │    │
│  │  │ Pipeline │ │Abstractn │ │ Runtime  │ │  Manager     │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
        │
┌───────┼─────────────────────────────────────────────────────────────┐
│       ▼                   INTEGRATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                Connector Runtime                             │    │
│  │                                                             │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │    │
│  │  │ Moodle │ │OpenSIS │ │Orange  │ │ERPNext │ │Microsoft │ │    │
│  │  │Conn.   │ │Conn.   │ │HRM Conn│ │Conn.   │ │ 365 Conn.│ │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘ │    │
│  │                                                             │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │    │
│  │  │Google  │ │VChainID│ │Generic │ │Webhook │ │CSV Import│ │    │
│  │  │Worksp. │ │Conn.   │ │REST    │ │        │ │          │ │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
        │
┌───────┼─────────────────────────────────────────────────────────────┐
│       ▼                     DATA LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL     │  │     Redis        │  │    S3/MinIO     │  │
│  │   + pgvector     │  │   Cache + Queue  │  │  File Storage   │  │
│  │                  │  │                  │  │                  │  │
│  │ • Main database  │  │ • Session cache  │  │ • Document      │  │
│  │ • Vector store   │  │ • Rate limiting  │  │ • Media files   │  │
│  │ • Audit logs     │  │ • Pub/sub        │  │ • Backups       │  │
│  │ • Analytics      │  │ • Job queue      │  │ • Exports       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend Framework | Next.js 15 (App Router) | SSR, RSC, excellent DX, Vercel ecosystem |
| UI Components | shadcn/ui + Tailwind CSS v4 | Accessible, customizable, tree-shakeable |
| Animations | Framer Motion | Declarative animations, layout animations |
| Backend Framework | NestJS | Modular, decorator-based, OpenAPI support |
| API Spec | OpenAPI 3.1 | Auto-generated from NestJS decorators |
| Database | PostgreSQL 16 | Feature-rich, reliable, extensible |
| Vector Store | pgvector | Co-located with main DB, no extra infra |
| Cache | Redis 7 | Multi-purpose: caching, queues, pub/sub |
| Auth | Auth.js v5 + NextAuth | Flexible, supports OAuth/OIDC/SAML/MFA |
| ORM | Prisma | Type-safe, migrations, great DX |
| Validation | Zod | Runtime type checking, schema inference |
| Testing | Vitest + Playwright | Fast, modern, E2E capable |
| Container | Docker Compose | Dev parity with production |
| CI/CD | GitHub Actions | Free for public repos, extensive ecosystem |
| AI SDK | Vercel AI SDK | Streaming, tool calling, multi-provider |
| Message Queue | BullMQ (Redis-backed) | TypeScript-native, job scheduling |

---

## 3. Multi-Tenant Architecture

CampusOS uses a **hybrid tenant isolation** strategy:

### 3.1 Data Isolation
- **Schema-per-tenant** for sensitive data (student records, grades, HR data)
- **Row-level tenant_id** for shared reference data (connector configs, workflow definitions)
- **Shared `public` schema** for global data (users, tenants, plans)

### 3.2 Tenant Resolution
```
Request → Domain/Subdomain → Tenant Header → JWT Claim → Tenant Context
```

### 3.3 Tenant Lifecycle
```
Registration → Provisioning → Verification → Active → Suspended → Terminated
```

---

## 4. Authentication & Authorization

### 4.1 Authentication Flow
```
User → Login → Auth.js → OAuth/OIDC/SAML → JWT → API Gateway → Service
```

### 4.2 Authorization Model
```
User → Role (Global) → Role (Tenant) → Permissions → Resource
```

Three-tier RBAC:
- **Platform-level:** superadmin, support, billing
- **Tenant-level:** admin, manager, viewer
- **Portal-level:** faculty, student, parent (permission sets)

### 4.3 Token Structure
```json
{
  "sub": "user_123",
  "tenant_id": "school_456",
  "roles": ["admin", "faculty"],
  "permissions": ["students:read", "grades:write"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 5. AI Architecture

### 5.1 Provider Abstraction Layer
```
Request → AI Orchestrator → Provider Router → [OpenAI | Anthropic | Google | OpenRouter]
                              ↓
                        Cost Tracker → Alert if over budget
                              ↓
                        Prompt Manager → Template + Context Assembly
                              ↓
                        RAG Pipeline → Vector Search → Context Injection
```

### 5.2 RAG Pipeline
```
User Query → Embedding Model → pgvector Similarity Search → Context Assembly
    ↓
LLM Query + Context → Streaming Response
```

### 5.3 Agent Architecture
```
User Intent → Agent Selector → Tool Definition → Tool Calling → Response
                                    ↓
                            Connector Gateway → External System
```

---

## 6. Integration Architecture

### 6.1 Connector Pattern
```typescript
interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  auth: AuthConfig;
  
  // Lifecycle
  initialize(config: ConnectorConfig): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  
  // Data operations
  fetch(resource: string, params: QueryParams): Promise<DataResult>;
  push(resource: string, data: unknown): Promise<WriteResult>;
  
  // Events
  subscribe(event: string, handler: EventHandler): Promise<void>;
  webhook(payload: WebhookPayload): Promise<void>;
}
```

### 6.2 Sync Engine
```
Connector → Sync Scheduler → Delta Detection → Data Transformation → Cache → Index
                ↓
          Conflict Resolution → Error Queue → Retry Policy → Alert
```

---

## 7. Data Flow Patterns

### 7.1 Synchronous (API Request)
```
Client → Next.js → NestJS Service → Prisma → PostgreSQL → Response
                     ↓
                 Redis Cache ⇄ Cache-aside
```

### 7.2 Asynchronous (Event-Driven)
```
Service → Event Emitter → Redis Pub/Sub → BullMQ Queue → Worker → Action
                                                              ↓
                                                         Update DB → Notify
```

### 7.3 Streaming (AI Responses)
```
Client → AI Chat → Vercel AI SDK → NestJS → Provider → Streaming Response
                                              ↓
                                          RAG Context ← pgvector
```

---

## 8. Security Architecture

### 8.1 Defense in Depth
```
Internet → WAF → Rate Limiter → API Gateway → Auth → Validation → Service
                                                  ↓
                                              RBAC → Permissions → Audit
```

### 8.2 Data Encryption
- **In transit:** TLS 1.3
- **At rest:** AES-256 (database encryption + disk encryption)
- **Secrets:** HashiCorp Vault or environment-specific secrets manager

### 8.3 Audit Trail
```
Every Request → Logger → Structured Log → Audit Service → PostgreSQL Audit Table
                                                              ↓
                                                          Immutable (Append-only)
```

---

## 9. Deployment Architecture

### 9.1 Development (Docker Compose)
```
┌─────────────────────────────────────────┐
│  docker-compose.yml                     │
│                                         │
│  nextjs-app   → localhost:3000          │
│  nestjs-api   → localhost:4000          │
│  postgres     → localhost:5432          │
│  redis        → localhost:6379          │
│  minio        → localhost:9000          │
│  mailpit      → localhost:8025          │
└─────────────────────────────────────────┘
```

### 9.2 Production (Kubernetes-Ready)
```
┌─────────────────────────────────────────┐
│  Kubernetes Cluster                     │
│                                         │
│  Ingress → TLS → Services → Pods        │
│  │                                       │
│  ├── frontend-deployment (Next.js)       │
│  ├── api-deployment (NestJS)             │
│  ├── worker-deployment (BullMQ worker)   │
│  ├── postgres-statefulset                │
│  ├── redis-statefulset                   │
│  └── minio-statefulset                   │
└─────────────────────────────────────────┘
```

---

## 10. Folder Structure

```
CampusOS/
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # Login, register, SSO
│   │   │   │   ├── (portal)/         # Authenticated portal
│   │   │   │   ├── api/              # Next.js API routes (BFF)
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── shared/           # Shared components
│   │   │   │   ├── dashboard/        # Dashboard-specific
│   │   │   │   ├── ai-chat/          # AI Chat components
│   │   │   │   └── workflow/         # Workflow builder
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, API client
│   │   │   ├── stores/              # Zustand stores
│   │   │   ├── types/               # TypeScript types
│   │   │   └── styles/              # Global styles
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── middleware/
│       │   ├── modules/
│       │   │   ├── auth/             # Identity & SSO
│       │   │   ├── tenants/          # Tenant management
│       │   │   ├── ai/               # AI Orchestrator
│       │   │   ├── chat/             # AI Chat
│       │   │   ├── integration/      # Integration Gateway
│       │   │   ├── connectors/       # Connector SDK
│       │   │   ├── workflow/         # Workflow Engine
│       │   │   ├── dashboard/        # Executive Dashboard
│       │   │   ├── analytics/        # Analytics
│       │   │   ├── knowledge/        # Knowledge Base
│       │   │   ├── notifications/    # Notifications
│       │   │   ├── audit/            # Audit Logs
│       │   │   ├── billing/          # Billing
│       │   │   ├── marketplace/      # Marketplace
│       │   │   └── portals/          # Portal backends
│       │   │       ├── student/
│       │   │       ├── parent/
│       │   │       ├── faculty/
│       │   │       └── admin/
│       │   ├── connectors/           # Connector implementations
│       │   │   ├── moodle/
│       │   │   ├── opensis/
│       │   │   ├── orangehrm/
│       │   │   ├── erpnext/
│       │   │   ├── m365/
│       │   │   ├── google-workspace/
│       │   │   └── vchainid/
│       │   ├── ai/
│       │   │   ├── providers/        # AI provider implementations
│       │   │   ├── agents/           # Agent runtime
│       │   │   ├── rag/              # RAG pipeline
│       │   │   └── prompts/          # Prompt templates
│       │   ├── database/
│       │   │   ├── prisma/
│       │   │   └── migrations/
│       │   └── config/
│       └── test/
│
├── packages/
│   ├── shared/                       # Shared types, utilities
│   │   ├── types/
│   │   ├── validators/              # Zod schemas
│   │   └── utils/
│   ├── connector-sdk/               # Connector SDK package
│   │   ├── src/
│   │   │   ├── connector.ts         # Base connector class
│   │   │   ├── auth/                # Auth handlers
│   │   │   ├── sync/                # Sync engine
│   │   │   └── types/               # Connector types
│   │   └── package.json
│   └── ui/                          # Shared UI components
│       ├── src/
│       └── package.json
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── docs/                            # Documentation
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Database.md
│   ├── API.md
│   ├── Roadmap.md
│   ├── Sprints.md
│   ├── Tasks.md
│   ├── Decisions.md
│   └── CHANGELOG.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── scripts/
│   ├── setup.sh
│   ├── seed.ts
│   └── dev.sh
│
├── CLAUDE.md                        # Claude Code context
├── turbo.json                       # Turborepo config
├── package.json                     # Root package.json
└── README.md
```
