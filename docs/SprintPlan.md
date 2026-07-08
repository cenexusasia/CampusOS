# CampusOS — Sprint Plan

## Sprint Cadence
- Duration: 2 weeks
- Planning: Monday (Week 1)
- Review: Friday (Week 2)
- Retro: Friday (Week 2)

## Active Sprint: Sprint 1 — Production Hardening

**Goal:** Resolve deployment debt, build Knowledge Base, add Connector Management UI.

### Sprint Backlog

| ID | Story | Points | Status |
|----|-------|--------|--------|
| S1-01 | **Knowledge Base Backend** — Upload/search/list/delete documents via API | 5 | 📝 |
| S1-02 | **Connector Management UI** — Settings page with connector cards, sync controls | 3 | 📝 |
| S1-03 | **Real Analytics Data** — Replace hardcoded charts with live API data | 3 | 📝 |
| S1-04 | **Deploy Cleanup** — Remove hardcoded API key, orphaned files | 1 | 📝 |
| S1-05 | **Documentation Suite** — PRD, Architecture, Roadmap, API, DB, Security, ADRs | 3 | ✅ |

### Story Details

#### S1-01: Knowledge Base Backend
- **Files:** `apps/api/src/modules/knowledge/`
- **Routes:** POST /upload, POST /search, GET /documents, DELETE /documents/:id
- **Accepts:** PDF, TXT, MD files
- **Storage:** Local `uploads/` directory, metadata in `Document` + `DocumentChunk` tables
- **Search:** Keyword matching on DocumentChunk content
- **Auth:** JWT + tenant-scoped

#### S1-02: Connector Management UI
- **Files:** `apps/web/src/app/(portal)/settings/connectors/page.tsx`
- **Cards:** Moodle, OpenSIS, Google (OAuth stub), ERP, CRM, Chatbot (coming soon)
- **Actions:** Connect, Sync Now, Disconnect
- **Data:** Fetches from `/api/v1/connectors/*` endpoints

#### S1-03: Real Analytics Data
- **Files:** `apps/web/src/app/(portal)/analytics/page.tsx`
- **Replace:** All hardcoded sample data with API calls
- **Endpoints:** `/api/v1/analytics/*`
- **States:** Loading, error, empty

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
