# CampusOS — Roadmap

## Phase 0: Foundation ✅ (Complete)
- [x] Monorepo scaffold (pnpm workspaces, Turbo)
- [x] Frontend base (Next.js, Tailwind, shadcn/ui)
- [x] API base (NestJS, Prisma, PostgreSQL)
- [x] Authentication (JWT, login/register)
- [x] Multi-tenant (Tenant model, membership, isolation)
- [x] Frontend deployment to Vercel
- [x] API deployment to Railway
- [x] Database connection (Supabase)
- [x] Basic UI (Dashboard, Students, Courses, Faculty)
- [x] AI Chat with DeepSeek

## Phase 1: Production Hardening 🔄 (Current Sprint)
| Epic | Status |
|------|--------|
| Knowledge Base | ⬜ Not started |
| Connector Management UI | ⬜ Not started |
| Real Analytics | ⬜ Not started |
| RBAC refinement | ⬜ Not started |
| Documentation suite | ✅ Complete |

## Phase 2: AI-Powered Features
| Feature | Priority | Dependencies |
|---------|----------|-------------|
| RAG Pipeline (pgvector) | P1 | Knowledge Base |
| AI Agents (task automation) | P1 | RAG |
| Multi-provider management UI | P2 | AI abstraction layer |
| AI-powered search across connectors | P2 | Connector SDK |

## Phase 3: Connector Ecosystem
| Feature | Priority | Notes |
|---------|----------|-------|
| Connector SDK (plugin interface) | P1 | Standardized pattern |
| ERPNext connector | P2 | Finance, HR, Inventory |
| Google Workspace connector | P2 | Calendar, Drive, Email |
| Webhook system | P2 | Real-time sync |
| Chatbot bridge | P3 | WhatsApp, Messenger |

## Phase 4: Enterprise Security & Compliance
| Feature | Priority | Notes |
|---------|----------|-------|
| SSO / SAML / OIDC | P1 | Required for universities |
| RBAC UI | P2 | Role/permission management |
| API rate limiting | P2 | Per-tenant |
| Audit log viewer | P2 | |
| Data encryption at rest | P3 | Tenant keys |
| Open Badges / VCs | P3 | Credential issuing |

## Phase 5: Scale & Optimize
| Feature | Priority | Notes |
|---------|----------|-------|
| Redis caching | P2 | Session store, query cache |
| Performance optimization | P2 | DB indexes, query tuning |
| Horizontal scaling | P3 | API stateless readiness |
| CI/CD improvements | P2 | Tests in pipeline |
| Monitoring (OpenTelemetry) | P2 | Logs, metrics, traces |

## Releases
| Version | Scope | Target |
|---------|-------|--------|
| v0.1.0 | Foundation + Auth + Basic UI | ✅ Done |
| v0.2.0 | Knowledge Base + Connectors UI | Sprint 1 |
| v0.3.0 | RAG + AI Agents | Sprint 2 |
| v0.4.0 | Connector SDK + ERPs | Sprint 3 |
| v1.0.0 | Enterprise Ready (RBAC, SSO, Audit) | Q4 2026 |
