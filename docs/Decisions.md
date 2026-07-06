# CampusOS — Architecture Decision Records

**Version:** 1.0.0  
**Last Updated:** 2026-07-06

---

## ADR-001: Modular Monolith with Microservices-Ready Architecture

**Status:** Accepted

**Context:** Building a multi-tenant SaaS platform with 18 modules. True microservices from day 1 would add significant complexity (service discovery, distributed tracing, eventual consistency) to the initial build.

**Decision:** Start with a modular monolith using NestJS module boundaries. Each module has clear bounded contexts, independent database schemas (where appropriate), and defined interfaces. This allows extracting individual modules into microservices when operational needs demand it.

**Consequences:**
- ✅ Faster initial development (single deployable)
- ✅ Shared infrastructure (DB connection pool, cache, logging)
- ✅ Easy debugging and testing
- ❌ Must enforce module isolation discipline
- ❌ Scaling requires extracting modules later

---

## ADR-002: Hybrid Multi-Tenancy (Schema + Row-Level)

**Status:** Accepted

**Context:** Different data types have different sensitivity levels. Student records and grades are highly sensitive and require strong isolation. Configuration data (connector settings, workflow definitions) is less sensitive and benefits from shared lookup.

**Decision:**
- **Schema-per-tenant** for sensitive domain data (student records, grades, HR data)
- **Row-level tenant_id** for shared reference data (connector configs, workflow definitions)
- **Public schema** for global data (users, tenants, subscription plans)

**Consequences:**
- ✅ Strong isolation for sensitive data
- ✅ Query efficiency for cross-tenant admin operations
- ❌ Increased migration complexity (must run against multiple schemas)
- ❌ Tenant provisioning requires schema creation

---

## ADR-003: pgvector over Dedicated Vector Database

**Status:** Accepted

**Context:** Need vector storage for RAG pipeline. Options included Pinecone, Weaviate, Qdrant, pgvector.

**Decision:** Use pgvector on the same PostgreSQL instance. Avoids operational complexity of managing a separate vector database. pgvector's IVFFlat indexes provide adequate performance for the expected scale.

**Consequences:**
- ✅ No additional infrastructure to manage
- ✅ ACID compliance for vector + relational data
- ✅ Lower latency (no network hop)
- ❌ Vector search performance degrades at very large scale (>10M vectors)
- ❌ Fewer advanced features than dedicated vector DBs (filtering, hybrid search)

---

## ADR-004: Auth.js over Keycloak

**Status:** Accepted

**Context:** Need authentication supporting OAuth2, OIDC, SAML, MFA, and RBAC. Keycloak is powerful but adds Java runtime and separate infrastructure. Auth.js integrates natively with Next.js.

**Decision:** Use Auth.js v5 with Prisma adapter. Provides all required auth providers, extensible callbacks for RBAC, and native Next.js integration. SAML support available via custom provider.

**Consequences:**
- ✅ No additional infrastructure (embed in Next.js)
- ✅ Native Next.js integration (middleware, API routes)
- ✅ Large provider ecosystem
- ❌ SAML support requires custom implementation
- ❌ Less mature MFA than Keycloak

---

## ADR-005: Prisma ORM over TypeORM / Drizzle

**Status:** Accepted

**Context:** Need TypeScript-first ORM with strong type safety, migration support, and good DX for a complex schema with 15+ models.

**Decision:** Use Prisma. Auto-generated TypeScript types, declarative schema, powerful migrations, and excellent VSCode integration. Prisma's middleware provides tenant schema switching.

**Consequences:**
- ✅ Best-in-class type safety
- ✅ Auto-generated queries and types
- ✅ Declarative migration workflow
- ❌ Raw query limitations for complex operations
- ❌ Slightly slower than Drizzle for simple queries

---

## ADR-006: BullMQ for Job Queue

**Status:** Accepted

**Context:** Need async job processing for sync engine, workflow execution, notification delivery, and scheduled tasks.

**Decision:** Use BullMQ backed by Redis. Native TypeScript support, job scheduling, retry policies, and worker concurrency control.

**Consequences:**
- ✅ TypeScript-native API
- ✅ Advanced scheduling and repeatable jobs
- ✅ Rate limiting and concurrency control
- ❌ Requires Redis (already in stack)
- ❌ No built-in dead letter queue (implement manually)

---

## ADR-007: Vercel AI SDK for Streaming

**Status:** Accepted

**Context:** Need streaming AI responses with multi-provider support, tool calling, and RAG integration.

**Decision:** Use Vercel AI SDK. Provides streaming hooks for React, multi-provider abstraction, and tool calling API.

**Consequences:**
- ✅ Streaming out of the box (React hooks)
- ✅ Provider abstraction (OpenAI, Anthropic, Google)
- ✅ Tool calling and function calling support
- ❌ Less control over underlying HTTP transport
- ❌ Provider-specific features may require raw SDK access

---

## ADR-008: Turborepo for Monorepo Management

**Status:** Accepted

**Context:** Need to manage multiple packages (web, api, shared, connector-sdk, ui) with shared tooling and efficient builds.

**Decision:** Use Turborepo with pnpm workspaces. Remote caching, parallel builds, and dependency graph optimization.

**Consequences:**
- ✅ Parallel task execution
- ✅ Build caching (local and remote)
- ✅ Dependency graph visualization
- ❌ Learning curve for cache configuration
- ❌ Remote caching requires Vercel account (optional)

---

## ADR-009: Cursor-Based Pagination over Offset

**Status:** Accepted

**Context:** List endpoints need pagination. Offset pagination has performance issues with large datasets and inconsistent results when data changes.

**Decision:** Use cursor-based pagination for all list endpoints. Cursors are opaque strings (base64-encoded composite keys).

**Consequences:**
- ✅ Consistent results regardless of data changes
- ✅ Better performance on large datasets
- ✅ Works well with infinite scroll
- ❌ Cannot jump to arbitrary pages
- ❌ More complex implementation

---

## ADR-010: SSE over WebSocket for AI Streaming

**Status:** Accepted

**Context:** AI chat needs real-time streaming of token-by-token responses. Options include Server-Sent Events (SSE), WebSockets, and long-polling.

**Decision:** Use SSE for AI streaming responses, WebSocket for bidirectional real-time features (notifications, dashboard updates). SSE is simpler for unidirectional streaming and works over HTTP/2.

**Consequences:**
- ✅ Simpler than WebSocket for streaming text
- ✅ Works with standard HTTP infrastructure (load balancers, proxies)
- ✅ Automatic reconnection (EventSource API)
- ❌ Unidirectional only (use WebSocket for bidirectional)
- ❌ Limited to text-based data

---

## ADR-011: Three-Tier RBAC

**Status:** Accepted

**Context:** Different authorization levels needed: platform-wide, tenant-wide, and portal-specific.

**Decision:**
- **Platform-level roles:** superadmin, support, billing
- **Tenant-level roles:** admin, manager, viewer
- **Portal roles:** faculty, student, parent (with permission sets)

**Consequences:**
- ✅ Clear separation of concerns
- ✅ Easier auditing
- ✅ Flexible permission assignment
- ❌ More complex permission checking logic
- ❌ Permission explosion at scale

---

## ADR-012: Event-Driven Architecture for Integrations

**Status:** Accepted

**Context:** System integrations need to react to data changes asynchronously without blocking the main request path.

**Decision:** Use event-driven architecture for all integration workflows. Services emit events to Redis pub/sub, which triggers BullMQ jobs for async processing.

**Consequences:**
- ✅ Loose coupling between services
- ✅ Async processing doesn't block API responses
- ✅ Easy to add new event consumers
- ❌ Eventual consistency (not immediate)
- ❌ Requires event schema management

---

## ADR-013: RESTful API with Future GraphQL Consideration

**Status:** Accepted

**Context:** Need API design that serves both internal frontend and external integrations. GraphQL offers flexibility but adds complexity.

**Decision:** Start with RESTful API (OpenAPI 3.1). Add GraphQL layer in Phase 6+ if portal dashboard queries demand flexible data fetching.

**Consequences:**
- ✅ Simple, well-understood API design
- ✅ Excellent tooling (Swagger, Postman, codegen)
- ✅ Caching at HTTP level
- ❌ Multiple endpoints for complex data needs
- ❌ Overfetching/underfetching for nested resources

---

## ADR-014: Tailwind CSS v4 + shadcn/ui

**Status:** Accepted

**Context:** Need a consistent, accessible, customizable design system that can support 5+ portals with distinct branding.

**Decision:** Use Tailwind CSS v4 for styling with shadcn/ui as the component foundation. Custom theme tokens for per-tenant branding.

**Consequences:**
- ✅ Rapid UI development
- ✅ Accessible components (Radix UI primitives)
- ✅ Customizable via CSS variables
- ✅ Tree-shakeable (only used components in bundle)
- ❌ Learning curve for Tailwind syntax

---

## ADR-015: Connector SDK as Separate Package

**Status:** Accepted

**Context:** Third-party developers will build connectors. Need a clean, versioned, documented SDK.

**Decision:** Publish `@campusos/connector-sdk` as a separate npm package with its own versioning, documentation, and CI.

**Consequences:**
- ✅ Clear API contract for connector developers
- ✅ Independent versioning (semver)
- ✅ Can be open-sourced independently
- ❌ Additional maintenance burden
- ❌ Must maintain backward compatibility

---

## ADR-016: Treat All System Data as Cache

**Status:** Accepted

**Context:** CampusOS synchronizes data from external systems (LMS, SIS, HRIS). The external system is the source of truth.

**Decision:** All data synced from external systems is treated as a cached copy. CampusOS never modifies external system data directly unless explicitly configured for bi-directional sync with clear ownership.

**Consequences:**
- ✅ Reduces risk of data corruption in source systems
- ✅ Simplifies sync logic (source always wins)
- ✅ Clear data ownership boundaries
- ❌ Requires re-sync after external system changes
- ❌ Stale data until next sync cycle
