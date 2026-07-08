# CampusOS — Sprint Plan

## Sprint Cadence
- Duration: 2 weeks
- Planning: Monday (Week 1)
- Review: Friday (Week 2)
- Retro: Friday (Week 2)

## Completed Sprint: Sprint 1 — Production Hardening ✅

**Goal:** Resolve deployment debt, build Knowledge Base, add Connector Management UI.

| ID | Story | Status | Delivered |
|----|-------|--------|-----------|
| S1-01 | **Knowledge Base Backend** | ✅ | Module with 4 routes, Document + DocumentChunk models, text extraction, keyword search |
| S1-02 | **Connector Management UI** | ✅ | Settings page with 6 connector cards, Sync/Connect/Disconnect actions |
| S1-03 | **Connector API Endpoint** | ✅ | GET /api/v1/connectors returns tenant's configured connectors |
| S1-03 | **Real Analytics Data** | ⏳ | Deferred to Sprint 2 — requires API endpoints first |
| S1-04 | **Deploy Cleanup** | ✅ | Hardcoded key removed → Railway env var, orphaned files cleaned |
| S1-05 | **Documentation Suite** | ✅ | 12 files, 81KB, 6 ADRs, OSS evaluation |

## Completed Sprint: Sprint 2 — AI RAG & Infrastructure ✅
...
## Active Sprint: Sprint 3 — Connector SDK & Event System

**Goal:** Build extensible connector SDK, event bus, webhooks.

| ID | Story | Points | Status |
|----|-------|--------|--------|
| S3-01 | **Connector SDK** — ConnectorPlugin interface, ConnectorRegistry, refactored Moodle/OpenSIS/Google | 8 | ✅ |
| S3-02 | **Event Bus** — BullMQ-based pub/sub with typed events, graceful Redis fallback | 5 | ✅ |
| S3-03 | **Webhook System** — Register/deliver/retry/log webhooks with HMAC signing | 5 | ✅ |
| S3-04 | **ERPNext Connector** — Finance + HR data sync | 5 | 📝 |
| S3-05 | **Google Workspace OAuth** — Complete OAuth flow | 3 | 📝 |

### Definition of Done (per Story)
- [ ] TypeScript compiles with zero errors
- [ ] `pnpm build` passes
- [ ] Tests pass
- [ ] UI renders correctly (responsive)
- [ ] API endpoints return correct data
- [ ] Security reviewed (JWT auth, tenant isolation)
- [ ] Documentation updated

## Future Sprints

### Sprint 2 — AI RAG & Agents
| Story | Description | Est. |
|-------|-------------|------|
| S2-01 | pgvector setup + document embeddings | 5 |
| S2-02 | Semantic search API | 3 |
| S2-03 | AI Agents framework | 8 |
| S2-04 | RAG-powered AI Chat | 5 |

### Sprint 3 — Connector Ecosystem
| Story | Description | Est. |
|-------|-------------|------|
| S3-01 | Connector SDK / Plugin Interface | 8 |
| S3-02 | ERPNext connector | 5 |
| S3-03 | Google Workspace connector | 3 |
| S3-04 | Webhook system | 5 |

### Sprint 4 — Enterprise Security
| Story | Description | Est. |
|-------|-------------|------|
| S4-01 | SSO / SAML / OIDC | 8 |
| S4-02 | RBAC management UI | 5 |
| S4-03 | Rate limiting middleware | 3 |
| S4-04 | Audit log viewer | 3 |

### Sprint 5 — Scale & Polish
| Story | Description | Est. |
|-------|-------------|------|
| S5-01 | Redis integration | 5 |
| S5-02 | Performance optimization | 5 |
| S5-03 | CI/CD pipeline improvements | 3 |
| S5-04 | Monitoring (OpenTelemetry) | 5 |
