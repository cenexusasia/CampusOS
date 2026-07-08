# CampusOS — Architecture & Roadmap

## Product Vision
CampusOS is the AI operating layer that sits on top of existing enterprise systems (LMS, ERP, CRM, Chatbot). It provides a single unified interface — users interact with CampusOS, which communicates with backend systems through secure connectors.

## Architecture Pillars

### 1. Multi-Tenant Platform ✅ (Existing)
- Tenants, Users, Memberships, Invites
- Each tenant has isolated data
- Plan/Subscription model per tenant

### 2. Connector Framework 🔶 (Partial)
- **Moodle Connector** ✅ MySQL sync working locally
- **OpenSIS Connector** ✅ MySQL sync working locally
- **Google Connector** 🔶 OAuth stub only
- **ERP Connector** ❌ Not started
- **CRM Connector** ❌ Not started
- **Chatbot Connector** ❌ Not started

### 3. AI Orchestration Layer 🔶 (Partial)
- **DeepSeek Chat** ✅ Direct fetch working (needs deploy)
- **Multi-provider** ✅ OpenAI, Anthropic, Google, OpenRouter support
- **Knowledge Base** 🔶 Frontend built, no backend
- **RAG Pipeline** ❌ Not started
- **Agent Framework** ❌ Not started

### 4. Unified Interface ✅ (Existing)
- Dashboard, Students, Courses, Faculty, Departments ✅
- Analytics, Settings, AI Chat ✅
- Responsive design (desktop + mobile) ✅
- Authentication with NextAuth ✅

## Immediate Roadmap (Sprint 1)

| Priority | Item | Status |
|----------|------|--------|
| 🔴 P0 | **Fix Railway deploy** | Delegated to subagent |
| 🔴 P0 | **AI Chat working on prod** | Waiting on deploy |
| 🟡 P1 | **Knowledge Base backend** | Documents upload + Q&A |
| 🟡 P1 | **Connector management UI** | CRUD for connectors in settings |
| 🟢 P2 | **ERP module (Finance, HR)** | Prisma schema + API |
| 🟢 P2 | **CRM module (Leads, Contacts)** | Prisma schema + API |
| 🔵 P3 | **Chatbot connector** | WhatsApp/Messenger bridge |
| 🔵 P3 | **Role-based portals** | Student, Faculty, Admin views |

## Technical Decisions

### API Architecture
```
┌─────────────────────────────────────┐
│         Vercel (Frontend)           │
│  Next.js 15 + Tailwind + shadcn/ui  │
└──────────┬──────────────────────────┘
           │ HTTPS
┌──────────▼──────────────────────────┐
│      Railway (API - NestJS)         │
│  • Auth (JWT)                       │
│  • Multi-tenant                     │
│  • Connectors (Moodle, ERP, CRM...) │
│  • AI Orchestrator                  │
│  • Analytics                        │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────┐  ┌──────────┐
│   Supabase (DB)     │  │ DeepSeek │
│   PostgreSQL        │  │   AI     │
└─────────────────────┘  └──────────┘

Local:
┌──────────────┐  ┌──────────┐  ┌──────────┐
│    Moodle    │  │ OpenSIS  │  │  ERP/CRM │
│  localhost   │  │ localhost│  │  (future)│
│    :8080     │  │  :8081   │  │          │
└──────────────┘  └──────────┘  └──────────┘
     ↕ Cloudflare Tunnel
┌─────────────────────────────────────┐
│  Railway API can sync via tunnels   │
└─────────────────────────────────────┘
```

### Connector Design Pattern
Each connector follows the same pattern:
1. `connect()` — Validate credentials, store config in database
2. `sync()` — Pull data from external system → CampusOS DB
3. `disconnect()` — Remove connection, clean up data
4. `webhook()` — Handle incoming events from external system (future)

### Key Design Rules
- All connectors are tenant-scoped
- Synchronous sync (batch), eventually real-time
- Fallback: MySQL direct query when REST API unavailable
- Connectors NEVER expose external system credentials to frontend

## Risk Register
| Risk | Mitigation |
|------|-----------|
| Railway deploy keeps failing | Use deploy dir with npm, not pnpm |
| DeepSeek API key exposure | In code as fallback only; Railway env var is primary |
| Local Moodle/OpenSIS unreachable | Cloudflare Tunnel provides public URL |
| TypeScript build errors | Removed tsc from build; use pre-compiled dist |
