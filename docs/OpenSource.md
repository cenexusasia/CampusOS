# CampusOS — Open Source Integration Recommendations

## Guiding Principle
**Do not reinvent solved problems.** CampusOS owns the experience layer. Open-source projects own the infrastructure. Only build custom code where it creates strategic differentiation.

---

## 1. Identity & Access Management

### Recommendation: Authentik
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐ | Active, growing fast |
| Maintenance | ⭐⭐⭐⭐⭐ | Weekly releases |
| Security | ⭐⭐⭐⭐⭐ | OWASP compliant, SSO, MFA |
| Enterprise | ⭐⭐⭐⭐ | SSO, LDAP, SAML, OIDC, SCIM |
| Docker | ⭐⭐⭐⭐⭐ | Official docker-compose |

**Why:** Keycloak is the "battle-tested enterprise" choice, but it's Java-based (heavy, 1GB+ RAM). Authentik is Python-based, lighter, has a modern UI, and supports proxy mode (forward auth) which integrates cleanly with our existing JWT auth. Authentik can wrap around our existing auth without replacing it entirely.

**Integration:** Authentik handles SSO (SAML/OIDC). Our existing JWT auth remains for direct logins. Authentik provides the "identity provider" layer, CampusOS provides the application layer.

**Docs:** https://goauthentik.io

---

## 2. Workflow Automation

### Recommendation: Temporal
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐⭐ | CNCF, wide adoption |
| Maintenance | ⭐⭐⭐⭐⭐ | Very active, regular releases |
| Security | ⭐⭐⭐⭐ | mTLS, encryption, RBAC |
| Scalability | ⭐⭐⭐⭐⭐ | Proven at Netflix, Snap, Stripe |
| Docker | ⭐⭐⭐⭐⭐ | docker-compose, Helm charts |

**Why:** Temporal wins over Camunda (heavy, Java, BPMN focus) and n8n (no-code focus, not for backend workflows). Temporal provides durable execution — workflows survive process crashes. Perfect for connector sync operations (long-running, failure-prone).

**Integration:** Temporal SDK (TypeScript) in the API. Each connector sync becomes a Temporal Workflow. Temporal Server runs alongside the API as a separate container.

**Alternative:** n8n — better if workflows need a no-code editor for non-technical users. Lower scalability.

**Docs:** https://temporal.io

---

## 3. AI Orchestration & RAG

### Recommendation: LlamaIndex (primary) + Haystack (alternative)
| Criteria | LlamaIndex | Haystack |
|----------|------------|----------|
| Community | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| RAG Quality | ⭐⭐⭐⭐⭐ (92% accuracy) | ⭐⭐⭐⭐ |
| Ease of Integration | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Production Readiness | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Why LlamaIndex:** Better retrieval quality (92% accuracy benchmarks). Strong data ingestion (PDF, Word, email, databases). Best for data-heavy indexing. Integrates with pgvector natively.

**Why not LangChain:** Over-engineered for our use case. Changes API too often. Better for agentic workflows, not pure RAG.

**Why not DSPy:** Academic, not production-ready yet.

**Integration:** LlamaIndex as library within the API (not as separate service). Handles document parsing, chunking, embedding, and retrieval. Our `POST /knowledge/search` calls LlamaIndex under the hood.

**Docs:** https://llamaindex.ai

---

## 4. Vector Database

### Recommendation: pgvector (PostgreSQL extension)
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐⭐ | Standard for Postgres vector search |
| Maintenance | ⭐⭐⭐⭐⭐ | Active, Supabase supports natively |
| Performance | ⭐⭐⭐⭐ | IVFFlat/HNSW indexes |
| Operational Cost | ⭐⭐⭐⭐⭐ | Zero new infrastructure |
| Maturity | ⭐⭐⭐⭐ | Production-ready since 2023 |

**Why:** Supabase already supports pgvector. No new database to manage. Zero additional cost. Good-enough performance for our scale (millions of vectors). Can migrate to Pinecone/Qdrant later if needed.

**Alternative:** Qdrant — better performance at scale, dedicated service. Pinecone — managed, expensive. Chroma — not production-ready.

**Integration:** `CREATE EXTENSION vector;` on Supabase. Add `embedding vector(1536)` column to DocumentChunk. Use Prisma `@db.Vector` type.

**Docs:** https://github.com/pgvector/pgvector

---

## 5. Document Parsing & OCR

### Recommendation: Apache Tika
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐ | Apache project, long history |
| Maintenance | ⭐⭐⭐⭐ | Stable releases |
| Formats | ⭐⭐⭐⭐⭐ | PDF, DOCX, XLSX, PPTX, HTML, 1000+ others |
| Accuracy | ⭐⭐⭐⭐ | Good text extraction |
| Docker | ⭐⭐⭐⭐⭐ | Official image |

**Why:** Tika is the most mature document parsing library. Handles PDF, Word, PowerPoint, Excel, images (via Tesseract OCR). Runs as a REST service or embedded Java library. We run it as a Docker container that our API calls for document parsing.

**Alternative:** Unstructured.io — modern, Python-based, AI-powered. Better for complex PDFs but heavier. Tika is simpler and proven.

**Integration:** Docker container alongside API. API sends file to Tika's `/rmeta` endpoint, gets structured text back. Text is chunked and stored in DocumentChunk.

**Docs:** https://tika.apache.org

---

## 6. Message Queue

### Recommendation: Redis (pub/sub) + BullMQ
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐⭐ | Huge ecosystem |
| Maintenance | ⭐⭐⭐⭐⭐ | Very active |
| Simplicity | ⭐⭐⭐⭐⭐ | Fits our stack (Node.js) |
| Docker | ⭐⭐⭐⭐⭐ | Single container |

**Why:** BullMQ runs on top of Redis, which we already plan to use for caching. No need for RabbitMQ or Kafka at our scale. BullMQ provides job queues, scheduling, retries, rate limiting, and progress tracking. Perfect for connector sync jobs.

**Integration:** Redis container + BullMQ in the API. Connector sync jobs are BullMQ workers. WebSocket notifications for job progress.

**Docs:** https://docs.bullmq.io

---

## 7. Enterprise Search

### Recommendation: Meilisearch
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐⭐ | Very active, 50k+ GitHub stars |
| Maintenance | ⭐⭐⭐⭐⭐ | Weekly releases |
| Performance | ⭐⭐⭐⭐⭐ | <50ms typo-tolerant search |
| Simplicity | ⭐⭐⭐⭐⭐ | Single binary, REST API |
| Docker | ⭐⭐⭐⭐⭐ | Official image |

**Why:** Meilisearch is dramatically simpler than Elasticsearch. Single binary, zero config, instant typo-tolerant search. Perfect for student search, course search, document search across the platform. Can index all our data and provide a unified search API.

**Alternative:** Elasticsearch — more powerful but operationally heavy (Java, needs tuning). Typesense — similar to Meilisearch, smaller community.

**Integration:** API pushes data to Meilisearch on create/update. Frontend calls Meilisearch's search API (or proxied through our API).

**Docs:** https://www.meilisearch.com

---

## 8. Monitoring & Observability

### Recommendation: OpenTelemetry + Grafana Stack
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐⭐ | CNCF, industry standard |
| Maintenance | ⭐⭐⭐⭐⭐ | Very active |
| Integration | ⭐⭐⭐⭐⭐ | Libraries for Node.js |
| Self-hosted | ⭐⭐⭐⭐⭐ | docker-compose |

**Why:** OpenTelemetry is the industry standard for observability. Grafana provides dashboards (metrics + logs + traces). We instrument the NestJS API with OpenTelemetry SDK, send to Grafana or self-hosted Loki + Tempo + Mimir.

**Integration:** `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-express`, `@prisma/instrumentation`.

**Docs:** https://opentelemetry.io

---

## 9. API Gateway

### Recommendation: Traefik (skip for now)
| Criteria | Score | Notes |
|----------|-------|-------|
| Community | ⭐⭐⭐⭐ | Active |
| Docker | ⭐⭐⭐⭐⭐ | Built for containers |
| Ease | ⭐⭐⭐⭐⭐ | Auto-discovers Docker services |

**Decision:** Not needed at current scale. Vercel + Railway handle routing. Add Traefik if we need self-hosted multi-service routing later.

---

## 10. Open Badges & Verifiable Credentials

### Recommendation: Open Badges (1EdTech standard) + DIDs
| Criteria | Score | Notes |
|----------|-------|-------|
| Standard | ⭐⭐⭐⭐⭐ | 1EdTech (formerly IMS Global) |
| Adoption | ⭐⭐⭐⭐⭐ | Used by universities worldwide |
| Library | ⭐⭐⭐ | community-lib/openbadges |

**Decision:** Use the OB 3.0 standard. Generate badges internally (no separate service needed initially). W3C Verifiable Credentials (VCs) for advanced use cases.

**Docs:** https://www.imsglobal.org/activity/digital-badges

---

## Integration Architecture (Future State)

```
┌──────────────────────────────────────────────────────────┐
│                  USER BROWSER (Vercel)                    │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│              CAMPUSOS API (NestJS/Railway)                │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth   │  │   RAG    │  │ Workflow │  │  Search  │  │
│  │(Custom) │  │(LlamaIdx)│  │(Temporal)│  │(Meilisearch)││
│  ├─────────┤  ├──────────┤  ├──────────┤  ├──────────┤  │
│  │ SSO     │  │ Documents│  │ Sync     │  │ Students │  │
│  │(Authentik)│ │(Apache   │  │ Connector│  │ Courses  │  │
│  │         │  │  Tika)   │  │ Jobs     │  │ Docs     │  │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                          │
│  BullMQ + Redis (Job Queue)                              │
│  OpenTelemetry (Logs + Metrics)                          │
└──────────────────────────────────────────────────────────┘
```

## Build vs. Buy Decision Matrix

| Capability | Build | Integrate | Rationale |
|-----------|-------|-----------|-----------|
| Identity/SSO | ❌ | ✅ Authentik | Mature standard, complex security |
| Workflow | ❌ | ✅ Temporal | Durable execution is non-trivial |
| RAG Pipeline | ❌ | ✅ LlamaIndex | Library, not infrastructure |
| Vector DB | ❌ | ✅ pgvector | Zero-new-infra |
| Document Parsing | ❌ | ✅ Apache Tika | 1000+ formats, mature |
| Connector SDK | ✅ | ❌ | Strategic differentiation |
| AI Chat UI | ✅ | ❌ | Strategic differentiation |
| Knowledge Base UI | ✅ | ❌ | Strategic differentiation |
| Search | ❌ | ✅ Meilisearch | Typo-tolerant, instant |
| Monitoring | ❌ | ✅ OpenTelemetry | Industry standard |
| Job Queue | ❌ | ✅ BullMQ + Redis | Proven, simple |
| ERPNext Connector | ✅ | ❌ | Strategic connector |
| Google Connector | ❌ | ✅ Google APIs | Official SDKs |

## Priority

| Priority | Integration | Sprint |
|----------|------------|--------|
| P1 | Meilisearch (unified search) | Sprint 3 |
| P1 | BullMQ + Redis (job queues) | Sprint 2 |
| P2 | LlamaIndex (RAG) | Sprint 2 |
| P2 | pgvector (embeddings) | Sprint 2 |
| P2 | Apache Tika (document parsing) | Sprint 2 |
| P3 | Authentik (SSO) | Sprint 4 |
| P3 | Temporal (workflow) | Sprint 5 |
| P3 | OpenTelemetry (monitoring) | Sprint 5 |
