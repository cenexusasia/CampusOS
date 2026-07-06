# CampusOS — Task Breakdown

**Version:** 1.0.0  
**Last Updated:** 2026-07-06

---

## Legend

| Status | Meaning |
|--------|---------|
| 🔴 Planned | Not yet started |
| 🟡 In Progress | Assigned to Claude Code |
| 🟢 Complete | Verified and merged |
| 🔵 Blocked | Waiting on dependency |

---

## Phase 1: Scaffolding & Infrastructure

### 1.1 Monorepo Setup
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-001 | Initialize Turborepo monorepo | 🔴 | — | 2h |
| T-002 | Configure pnpm workspaces | 🔴 | T-001 | 1h |
| T-003 | Create root tsconfig, eslint, prettier | 🔴 | T-001 | 1h |
| T-004 | Set up GitHub repository with branch protection | 🔴 | — | 1h |
| T-005 | Create .gitignore, .env.example, README.md | 🔴 | T-001 | 1h |

### 1.2 Next.js Frontend Shell
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-010 | Scaffold Next.js 15 with App Router | 🔴 | T-001 | 2h |
| T-011 | Configure Tailwind CSS v4 | 🔴 | T-010 | 1h |
| T-012 | Install and configure shadcn/ui (button, input, card, dialog, form, toast) | 🔴 | T-011 | 2h |
| T-013 | Configure Framer Motion | 🔴 | T-010 | 1h |
| T-014 | Create base layout (header, sidebar, footer) | 🔴 | T-010 | 2h |
| T-015 | Create 404, loading, error pages | 🔴 | T-014 | 1h |
| T-016 | Configure Next.js API route BFF layer | 🔴 | T-010 | 1h |

### 1.3 NestJS Backend Shell
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-020 | Scaffold NestJS app with CLI | 🔴 | T-001 | 2h |
| T-021 | Configure Swagger/OpenAPI | 🔴 | T-020 | 1h |
| T-022 | Create global exception filter | 🔴 | T-020 | 1h |
| T-023 | Create validation pipe (Zod integration) | 🔴 | T-020 | 1h |
| T-024 | Create logging interceptor | 🔴 | T-020 | 1h |
| T-025 | Create request ID middleware | 🔴 | T-020 | 30m |
| T-026 | Set up health check endpoints | 🔴 | T-020 | 1h |
| T-027 | Configure CORS, helmet, compression | 🔴 | T-020 | 30m |

### 1.4 Docker Compose Infrastructure
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-030 | Create docker-compose.yml with postgres:16 + pgvector | 🔴 | — | 2h |
| T-031 | Add Redis 7 service | 🔴 | — | 1h |
| T-032 | Add MinIO service | 🔴 | — | 1h |
| T-033 | Add Mailpit service | 🔴 | — | 30m |
| T-034 | Create Dockerfiles for web and api | 🔴 | T-010, T-020 | 2h |
| T-035 | Create docker-compose.override.yml for development | 🔴 | T-030 | 1h |
| T-036 | Add healthcheck configurations | 🔴 | T-030 | 1h |

### 1.5 CI/CD Pipeline
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-040 | Create GitHub Actions CI workflow (lint → typecheck → test → build) | 🔴 | T-005 | 2h |
| T-041 | Create GitHub Actions deploy workflow | 🔴 | T-005 | 1h |
| T-042 | Set up branch protection rules for main | 🔴 | T-005 | 30m |

### 1.6 Shared Package
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-050 | Create packages/shared with type definitions | 🔴 | T-001 | 2h |
| T-051 | Create shared Zod validation schemas | 🔴 | T-050 | 2h |
| T-052 | Create shared utility functions | 🔴 | T-050 | 1h |
| T-053 | Create packages/ui with shared components | 🔴 | T-011 | 3h |

### 1.7 Prisma Setup
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-060 | Install Prisma and configure schema | 🔴 | T-030 | 2h |
| T-061 | Define all models (see Database.md for full schema) | 🔴 | T-060 | 4h |
| T-062 | Create initial migration | 🔴 | T-061 | 1h |
| T-063 | Create Prisma service module in NestJS | 🔴 | T-020, T-060 | 1h |
| T-064 | Create seed script with realistic demo data | 🔴 | T-062 | 3h |

---

## Phase 2: Identity & Tenant Management

### 2.1 Auth.js Integration
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-100 | Install and configure Auth.js v5 with Prisma adapter | 🔴 | T-062 | 3h |
| T-101 | Implement credentials provider (email/password) | 🔴 | T-100 | 2h |
| T-102 | Implement Google OAuth provider | 🔴 | T-100 | 1h |
| T-103 | Implement Microsoft 365 OAuth provider | 🔴 | T-100 | 1h |
| T-104 | Create sign-in/sign-up pages | 🔴 | T-101 | 3h |
| T-105 | Implement password reset flow | 🔴 | T-101 | 2h |
| T-106 | Set up JWT session handling | 🔴 | T-100 | 2h |
| T-107 | Create auth middleware for API routes | 🔴 | T-106 | 1h |

### 2.2 RBAC & Permissions
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-110 | Define role hierarchy and permissions matrix | 🔴 | T-106 | 2h |
| T-111 | Create NestJS RBAC guards (Roles, Permissions decorators) | 🔴 | T-110 | 3h |
| T-112 | Create permission checking utility functions | 🔴 | T-110 | 1h |
| T-113 | Implement user-role assignment API | 🔴 | T-111 | 2h |

### 2.3 Tenant Management
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-120 | Create tenant CRUD service | 🔴 | T-062 | 3h |
| T-121 | Implement tenant schema provisioning logic | 🔴 | T-060 | 4h |
| T-122 | Create tenant middleware (domain/header resolution) | 🔴 | T-120 | 2h |
| T-123 | Create tenant context provider for NestJS | 🔴 | T-122 | 1h |
| T-124 | Implement tenant onboarding API | 🔴 | T-121 | 3h |
| T-125 | Create invitation flow (invite → email → accept) | 🔴 | T-124 | 3h |
| T-126 | Implement member management (add/remove/role change) | 🔴 | T-125 | 2h |
| T-127 | Create tenant settings UI | 🔴 | T-126 | 3h |
| T-128 | Implement feature flags per tenant | 🔴 | T-122 | 2h |

### 2.4 Frontend Integration
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-130 | Create AuthContext provider (React) | 🔴 | T-106, T-014 | 2h |
| T-131 | Create protected route wrapper | 🔴 | T-130 | 1h |
| T-132 | Create login page UI | 🔴 | T-104 | 2h |
| T-133 | Create registration page UI | 🔴 | T-104 | 2h |
| T-134 | Create password reset pages | 🔴 | T-105 | 2h |
| T-135 | Create user profile page with settings | 🔴 | T-130 | 3h |
| T-136 | Create tenant switcher component | 🔴 | T-127 | 1h |
| T-137 | Create MFA setup UI | 🔴 | T-106 | 2h |

---

## Phase 3: AI Orchestrator & Chat

### 3.1 Provider Abstraction Layer
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-200 | Define AI provider interface | 🔴 | T-020 | 2h |
| T-201 | Implement OpenAI provider | 🔴 | T-200 | 3h |
| T-202 | Implement Anthropic provider | 🔴 | T-200 | 3h |
| T-203 | Implement Google AI provider | 🔴 | T-200 | 3h |
| T-204 | Implement OpenRouter provider | 🔴 | T-200 | 3h |
| T-205 | Create provider registry with DI | 🔴 | T-201-204 | 2h |
| T-206 | Implement provider routing (priority, fallback) | 🔴 | T-205 | 2h |
| T-207 | Create provider management API | 🔴 | T-205 | 2h |
| T-208 | Implement cost tracking per provider | 🔴 | T-207 | 2h |

### 3.2 RAG Pipeline
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-210 | Create document processing pipeline | 🔴 | T-200 | 4h |
| T-211 | Implement text extraction (PDF, DOCX, TXT) | 🔴 | T-210 | 3h |
| T-212 | Implement chunking strategies (recursive, semantic) | 🔴 | T-210 | 3h |
| T-213 | Implement embedding generation (via AI provider) | 🔴 | T-200, T-212 | 2h |
| T-214 | Create pgvector similarity search service | 🔴 | T-060 | 3h |
| T-215 | Implement context assembly | 🔴 | T-213, T-214 | 2h |
| T-216 | Create document management API | 🔴 | T-210 | 3h |
| T-217 | Create document management UI | 🔴 | T-216 | 4h |

### 3.3 AI Chat
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-220 | Create conversation CRUD service | 🔴 | T-200, T-062 | 2h |
| T-221 | Implement streaming message endpoint (SSE) | 🔴 | T-200, T-220 | 3h |
| T-222 | Create Chat UI component (message list, input, streaming) | 🔴 | T-221 | 4h |
| T-223 | Implement conversation sidebar with search | 🔴 | T-222 | 3h |
| T-224 | Add context awareness (user, role, connected systems) | 🔴 | T-221 | 3h |
| T-225 | Implement file upload in chat | 🔴 | T-222 | 2h |
| T-226 | Add conversation export (PDF/Markdown) | 🔴 | T-223 | 2h |
| T-227 | Create AI tutor persona system | 🔴 | T-224 | 2h |

### 3.4 Agent Runtime
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-230 | Define agent interface (tool-calling, planning) | 🔴 | T-200 | 3h |
| T-231 | Implement tool registry and discovery | 🔴 | T-230 | 2h |
| T-232 | Create connector tool adapters | 🔴 | T-230, 3.x | 3h |
| T-233 | Implement agent execution loop | 🔴 | T-230 | 4h |
| T-234 | Add MCP protocol support | 🔴 | T-233 | 3h |

---

## Phase 4: Integration Gateway & Connector SDK

### 4.1 Integration Gateway
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-300 | Create Integration module | 🔴 | T-020 | 2h |
| T-301 | Implement request forwarding/API gateway | 🔴 | T-300 | 4h |
| T-302 | Implement rate limiting per connector | 🔴 | T-300 | 2h |
| T-303 | Implement circuit breaker pattern | 🔴 | T-300 | 3h |
| T-304 | Implement request/response transformation | 🔴 | T-301 | 3h |
| T-305 | Create connector authentication handler | 🔴 | T-300 | 3h |
| T-306 | Implement health monitoring service | 🔴 | T-300 | 2h |
| T-307 | Create webhook receiver | 🔴 | T-300 | 2h |

### 4.2 Connector SDK
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-310 | Design and implement Connector base class | 🔴 | T-300 | 4h |
| T-311 | Implement OAuth2 auth handler | 🔴 | T-310 | 3h |
| T-312 | Implement API key auth handler | 🔴 | T-310 | 1h |
| T-313 | Implement Basic auth handler | 🔴 | T-310 | 1h |
| T-314 | Implement sync engine (full, incremental, delta) | 🔴 | T-310 | 4h |
| T-315 | Implement data transformation layer | 🔴 | T-310 | 3h |
| T-316 | Create connector lifecycle manager (install/upgrade/remove) | 🔴 | T-310 | 3h |
| T-317 | Create connector scaffolding CLI | 🔴 | T-310 | 3h |
| T-318 | Write connector SDK documentation | 🔴 | T-317 | 3h |

### 4.3 Sync Engine
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-320 | Implement sync scheduler (BullMQ) | 🔴 | T-314 | 3h |
| T-321 | Implement delta detection (checksum/timestamp) | 🔴 | T-314 | 3h |
| T-322 | Implement conflict resolution strategies | 🔴 | T-314 | 2h |
| T-323 | Create sync progress tracking | 🔴 | T-320 | 2h |
| T-324 | Create sync log storage and reporting | 🔴 | T-320 | 2h |
| T-325 | Implement sync alerts | 🔴 | T-324 | 1h |

### 4.4 Connector Management UI
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-330 | Create connector marketplace browser | 🔴 | T-316 | 3h |
| T-331 | Implement installation flow UI | 🔴 | T-316 | 3h |
| T-332 | Create dynamic configuration form | 🔴 | T-316 | 3h |
| T-333 | Implement OAuth setup UI (redirect flow) | 🔴 | T-311 | 2h |
| T-334 | Create sync schedule configuration | 🔴 | T-320 | 2h |
| T-335 | Implement connector health dashboard | 🔴 | T-306 | 2h |
| T-336 | Create sync log viewer | 🔴 | T-324 | 2h |

---

## Phase 5: Workflow Engine & Portals

### 5.1 Workflow Engine
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-400 | Create Workflow module | 🔴 | T-020 | 2h |
| T-401 | Implement trigger system (cron, event, webhook) | 🔴 | T-400 | 4h |
| T-402 | Implement step execution engine | 🔴 | T-400 | 4h |
| T-403 | Implement action types (notify, API, conditional) | 🔴 | T-400 | 3h |
| T-404 | Implement approval chain system | 🔴 | T-400 | 3h |
| T-405 | Create workflow versioning | 🔴 | T-400 | 2h |
| T-406 | Implement workflow testing/simulation | 🔴 | T-402 | 2h |
| T-407 | Create workflow API endpoints | 🔴 | T-400-406 | 2h |

### 5.2 Workflow Builder UI
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-410 | Create workflow list view with CRUD | 🔴 | T-407 | 3h |
| T-411 | Implement drag-and-drop workflow canvas | 🔴 | T-410 | 5h |
| T-412 | Create trigger configuration panel | 🔴 | T-401, T-411 | 3h |
| T-413 | Implement step configuration forms | 🔴 | T-402, T-411 | 3h |
| T-414 | Create approval step UI | 🔴 | T-404, T-411 | 2h |
| T-415 | Implement workflow testing UI | 🔴 | T-406, T-411 | 2h |
| T-416 | Create workflow template library | 🔴 | T-411 | 2h |
| T-417 | Implement import/export (JSON) | 🔴 | T-411 | 1h |

### 5.3 Admin Portal
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-420 | Create admin layout with sidebar | 🔴 | T-014 | 3h |
| T-421 | Create tenant management page | 🔴 | T-127 | 3h |
| T-422 | Create user management page | 🔴 | T-126 | 3h |
| T-423 | Create role/permission management | 🔴 | T-112 | 3h |
| T-424 | Create system health dashboard | 🔴 | T-335 | 3h |
| T-425 | Create audit log viewer | 🔴 | T-604 | 2h |
| T-426 | Create system settings page | 🔴 | T-127 | 2h |

### 5.4 Faculty Portal
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-430 | Create faculty dashboard layout | 🔴 | T-014 | 3h |
| T-431 | Implement unified gradebook view | 🔴 | T-430 | 5h |
| T-432 | Create attendance management UI | 🔴 | T-430 | 4h |
| T-433 | Implement AI teaching assistant panel | 🔴 | T-227, T-430 | 3h |
| T-434 | Create course management view | 🔴 | T-430 | 3h |
| T-435 | Implement student performance analytics | 🔴 | T-430, T-502 | 3h |
| T-436 | Create class roster management | 🔴 | T-430 | 2h |

### 5.5 Student Portal
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-440 | Create student dashboard layout | 🔴 | T-014 | 3h |
| T-441 | Implement grade viewer | 🔴 | T-440 | 4h |
| T-442 | Create assignment tracker with deadlines | 🔴 | T-440 | 4h |
| T-443 | Implement AI tutor chat | 🔴 | T-227, T-440 | 3h |
| T-444 | Create enrollment/course registration view | 🔴 | T-440 | 3h |
| T-445 | Implement SSO launchpad | 🔴 | T-440, T-106 | 3h |
| T-446 | Create event calendar | 🔴 | T-440 | 3h |

### 5.6 Parent Portal
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-450 | Create parent dashboard layout | 🔴 | T-014 | 3h |
| T-451 | Implement student progress dashboard | 🔴 | T-450 | 4h |
| T-452 | Create grade alerts and notifications | 🔴 | T-450, T-605 | 3h |
| T-453 | Implement attendance tracking view | 🔴 | T-450 | 3h |
| T-454 | Create fee/payment management | 🔴 | T-450, T-700 | 3h |
| T-455 | Implement communication with faculty | 🔴 | T-450 | 3h |
| T-456 | Create multiple student management | 🔴 | T-451 | 2h |

---

## Phase 6: Analytics, Knowledge, Notifications, Audit

### 6.1 Analytics Engine
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-500 | Create Analytics module | 🔴 | T-020 | 2h |
| T-501 | Implement data aggregation pipelines | 🔴 | T-500 | 4h |
| T-502 | Create pre-computed metric caching | 🔴 | T-500 | 3h |
| T-503 | Implement analytics query builder | 🔴 | T-500 | 4h |
| T-504 | Implement drill-down query support | 🔴 | T-503 | 3h |
| T-505 | Create trend analysis calculations | 🔴 | T-500 | 2h |
| T-506 | Create export engine (PDF, CSV, Excel) | 🔴 | T-500 | 3h |
| T-507 | Implement scheduled report generation | 🔴 | T-500 | 2h |
| T-508 | Create analytics API endpoints | 🔴 | T-501-507 | 2h |

### 6.2 Report Builder
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-510 | Create report list/dashboard view | 🔴 | T-508 | 3h |
| T-511 | Implement visual report builder | 🔴 | T-510 | 5h |
| T-512 | Create data source selector | 🔴 | T-510 | 2h |
| T-513 | Implement chart configuration (bar, line, pie, table) | 🔴 | T-510 | 4h |
| T-514 | Create scheduled delivery configuration | 🔴 | T-507, T-510 | 2h |
| T-515 | Implement report sharing | 🔴 | T-510 | 2h |
| T-516 | Create report template library | 🔴 | T-510 | 2h |

### 6.3 Knowledge Base
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-520 | Create Knowledge module | 🔴 | T-020 | 2h |
| T-521 | Implement article CRUD | 🔴 | T-520 | 3h |
| T-522 | Create rich text editor integration | 🔴 | T-521 | 2h |
| T-523 | Implement full-text search | 🔴 | T-520 | 2h |
| T-524 | Create AI-powered semantic search | 🔴 | T-520, T-214 | 3h |
| T-525 | Implement article versioning | 🔴 | T-521 | 2h |
| T-526 | Create publishing workflow (draft→review→published) | 🔴 | T-521 | 2h |
| T-527 | Create knowledge base UI | 🔴 | T-521-526 | 4h |

### 6.4 Notifications
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-600 | Create Notifications module | 🔴 | T-020 | 2h |
| T-601 | Implement notification storage and retrieval | 🔴 | T-062, T-600 | 2h |
| T-602 | Create email notification channel (Nodemailer) | 🔴 | T-600 | 3h |
| T-603 | Create in-app notification channel | 🔴 | T-600 | 2h |
| T-604 | Create notification template system | 🔴 | T-600 | 3h |
| T-605 | Implement notification preferences | 🔴 | T-600 | 2h |
| T-606 | Create in-app notification inbox UI | 🔴 | T-603 | 3h |
| T-607 | Implement email digest system | 🔴 | T-602 | 2h |

### 6.5 Audit Logs
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-610 | Create Audit module | 🔴 | T-020 | 2h |
| T-611 | Implement audit event capture middleware | 🔴 | T-610 | 2h |
| T-612 | Create audit log query API | 🔴 | T-610 | 2h |
| T-613 | Implement audit log export | 🔴 | T-610 | 1h |
| T-614 | Create audit log viewer UI | 🔴 | T-612 | 3h |

---

## Phase 7: Billing & Marketplace

### 7.1 Billing
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-700 | Integrate Stripe SDK | 🔴 | T-020 | 2h |
| T-701 | Implement subscription plan CRUD | 🔴 | T-700 | 3h |
| T-702 | Create Stripe checkout integration | 🔴 | T-700 | 3h |
| T-703 | Implement webhook handling | 🔴 | T-700 | 3h |
| T-704 | Create invoice generation | 🔴 | T-701 | 2h |
| T-705 | Implement usage metering | 🔴 | T-700 | 3h |
| T-706 | Create billing portal UI | 🔴 | T-701-705 | 4h |

### 7.2 Marketplace
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-710 | Create Marketplace module | 🔴 | T-020 | 2h |
| T-711 | Implement connector listing CRUD | 🔴 | T-710 | 3h |
| T-712 | Create marketplace browse UI | 🔴 | T-710 | 3h |
| T-713 | Implement one-click install flow | 🔴 | T-711, T-316 | 3h |
| T-714 | Create version management (semver) | 🔴 | T-710 | 2h |
| T-715 | Implement rating and review system | 🔴 | T-710 | 2h |

---

## Phase 8: Connector Implementations

### 8.1 Moodle Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-800 | Implement Moodle REST API client | 🔴 | T-310 | 4h |
| T-801 | Implement course sync | 🔴 | T-800 | 3h |
| T-802 | Implement user/enrollment sync | 🔴 | T-800 | 3h |
| T-803 | Implement grade sync | 🔴 | T-800 | 3h |
| T-804 | Implement assignment sync | 🔴 | T-800 | 2h |
| T-805 | Create Moodle webhook handler | 🔴 | T-800 | 2h |

### 8.2 OpenSIS Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-810 | Implement OpenSIS API client | 🔴 | T-310 | 4h |
| T-811 | Implement student record sync | 🔴 | T-810 | 3h |
| T-812 | Implement attendance sync | 🔴 | T-810 | 3h |
| T-813 | Implement grade sync | 🔴 | T-810 | 3h |
| T-814 | Implement schedule sync | 🔴 | T-810 | 3h |

### 8.3 OrangeHRM Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-820 | Implement OrangeHRM API client | 🔴 | T-310 | 3h |
| T-821 | Implement employee record sync | 🔴 | T-820 | 3h |
| T-822 | Implement leave/attendance sync | 🔴 | T-820 | 2h |

### 8.4 ERPNext Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-830 | Implement ERPNext API client | 🔴 | T-310 | 3h |
| T-831 | Implement finance data sync | 🔴 | T-830 | 3h |
| T-832 | Implement inventory sync | 🔴 | T-830 | 2h |

### 8.5 Microsoft 365 Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-840 | Implement Microsoft Graph API client | 🔴 | T-310 | 4h |
| T-841 | Implement email/calendar sync | 🔴 | T-840 | 3h |
| T-842 | Implement Teams integration | 🔴 | T-840 | 3h |
| T-843 | Implement user/directory sync | 🔴 | T-840 | 2h |

### 8.6 Google Workspace Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-850 | Implement Google API client | 🔴 | T-310 | 4h |
| T-851 | Implement Gmail/Calendar sync | 🔴 | T-850 | 3h |
| T-852 | Implement Drive sync | 🔴 | T-850 | 2h |

### 8.7 VChainID Connector
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-860 | Implement VChainID API client | 🔴 | T-310 | 3h |
| T-861 | Implement credential verification | 🔴 | T-860 | 3h |

### 8.8 Generic Connectors
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-870 | Implement Generic REST connector | 🔴 | T-310 | 3h |
| T-871 | Implement Webhook connector (inbound/outbound) | 🔴 | T-310 | 3h |
| T-872 | Implement CSV Import connector | 🔴 | T-310 | 3h |

---

## Phase 9: Testing, Hardening & Launch

### 9.1 Security
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-900 | Security audit (OWASP Top 10) | 🔴 | All features | 8h |
| T-901 | Penetration testing | 🔴 | T-900 | 8h |
| T-902 | Secrets scanning (GitHub Advanced Security) | 🔴 | T-900 | 2h |
| T-903 | Dependency vulnerability audit | 🔴 | — | 2h |
| T-904 | Rate limiting hardening | 🔴 | T-900 | 2h |
| T-905 | Input validation audit | 🔴 | T-900 | 3h |

### 9.2 Performance
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-910 | Load testing with k6 | 🔴 | All features | 6h |
| T-911 | Database query optimization | 🔴 | T-910 | 4h |
| T-912 | Caching strategy implementation | 🔴 | T-910 | 4h |
| T-913 | Bundle size optimization | 🔴 | T-910 | 2h |
| T-914 | Image/CDN optimization | 🔴 | T-910 | 2h |

### 9.3 E2E Testing
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-920 | Set up Playwright test suite | 🔴 | All features | 3h |
| T-921 | Auth flow E2E tests | 🔴 | T-920 | 2h |
| T-922 | Tenant management E2E tests | 🔴 | T-920 | 2h |
| T-923 | AI Chat E2E tests | 🔴 | T-920 | 2h |
| T-924 | Portal E2E tests (admin, faculty, student, parent) | 🔴 | T-920 | 4h |
| T-925 | Workflow E2E tests | 🔴 | T-920 | 3h |
| T-926 | Connector E2E tests | 🔴 | T-920 | 3h |

### 9.4 Accessibility
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-930 | WCAG AA audit | 🔴 | All portals | 4h |
| T-931 | Keyboard navigation fixes | 🔴 | T-930 | 3h |
| T-932 | Screen reader testing | 🔴 | T-930 | 3h |
| T-933 | Color contrast compliance | 🔴 | T-930 | 2h |

### 9.5 Deployment
| ID | Task | Status | Dependencies | Est. Effort |
|----|------|--------|-------------|-------------|
| T-940 | Production Docker Compose config | 🔴 | T-034 | 3h |
| T-941 | Monitoring setup (healthcheck, logs, metrics) | 🔴 | T-940 | 4h |
| T-942 | Backup and disaster recovery plan | 🔴 | T-940 | 2h |
| T-943 | Deployment runbook | 🔴 | T-940 | 3h |
| T-944 | Production environment provisioning | 🔴 | T-940 | 2h |
| T-945 | Go-live checklist | 🔴 | T-940 | 2h |
