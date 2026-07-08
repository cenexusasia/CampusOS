# CampusOS — Product Requirements Document

## Version History
| Date | Author | Changes |
|------|--------|---------|
| 2026-07-08 | CTO | Initial draft |

## 1. Product Overview

### 1.1 Vision
Create the best AI-powered Enterprise Operating System for education. CampusOS is the **AI operating layer** that sits on top of existing enterprise systems (LMS, ERP, CRM, Chatbot). It becomes the **single interface** users interact with. Existing systems remain in the background, accessed through secure connectors.

### 1.2 What CampusOS Is NOT
- An LMS (replaced by Moodle/Canvas)
- An ERP (replaced by ERPNext)
- A CRM (replaced by Salesforce/SuiteCRM)
- A Chatbot (replaced by third-party bots)

CampusOS **is** the intelligent orchestrator that unifies these systems.

### 1.3 Target Markets
| Market | First Implementation | Connectors Needed |
|--------|-------------------|--------------------|
| 🎓 Universities | De La Salle Philippines (Flagship) | LMS, ERP, CRM, HR |
| 🏫 School Systems | K-12 follow-up | LMS, SIS, Gradebook |
| 🏛 Government | Future | Document Mgmt, HR, Payroll |
| 🏥 Hospitals | Future | EHR, Scheduling, Billing |
| 🏢 Enterprise | Future | ERP, CRM, HR, BI |

### 1.4 Core Principles
- **Multi-tenant** — every tenant is fully isolated
- **AI-first** — every interaction is AI-augmented
- **Connector-based** — existing systems are integrated, not replaced
- **Permission-aware** — AI never accesses unauthorized data
- **API-first** — every feature has a public API

## 2. User Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| Student | Enrolled learner | View courses, grades, schedule, AI tutor |
| Instructor | Faculty member | Manage courses, grade, communicate |
| Department Head | Academic leader | Analytics, curriculum, faculty management |
| IT Admin | System operator | Connectors, users, settings, monitoring |
| Super Admin | Platform operator | All tenants, billing, infrastructure |
| Parent | Student guardian | Progress reports, communication |

## 3. Feature Requirements

### 3.1 Core Platform (MVP)
- [x] Multi-tenant authentication (email + password)
- [x] JWT-based session management
- [x] Tenant isolation (data, users, settings)
- [ ] SSO / OAuth integration
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Rate limiting

### 3.2 Unified Interface (MVP)
- [x] Dashboard — personalized AI-powered overview
- [x] Students — list, search, profiles
- [x] Courses — list, enrollment, management
- [x] Faculty — directory, assignments
- [ ] Departments — structure, hierarchy
- [ ] Analytics — real metrics (currently hardcoded)
- [ ] Settings — tenant configuration, user management

### 3.3 AI Features
- [x] AI Chat — DeepSeek-powered conversational interface
- [x] Multi-provider abstraction (OpenAI, Anthropic, Google, OpenRouter)
- [ ] RAG — document-aware AI responses
- [ ] Role-aware retrieval — AI sees only what user has access to
- [ ] Knowledge Base — upload documents, search semantically
- [ ] AI Agents — autonomous task execution

### 3.4 Connectors
- [x] Moodle — course/user sync via MySQL
- [x] OpenSIS — student sync via MySQL
- [ ] Google Workspace — OAuth integration
- [ ] ERP (ERPNext) — finance, HR, inventory
- [ ] CRM — leads, contacts, communication
- [ ] Chatbot — WhatsApp/Messenger bridge

### 3.5 Security
- [ ] Zero Trust architecture
- [ ] RBAC with fine-grained permissions
- [ ] Tenant-level data encryption
- [ ] API rate limiting
- [ ] Secrets management (hashed)
- [ ] Permission-aware AI queries

### 3.6 Enterprise Features
- [ ] Audit log export
- [ ] Open Badges / Verifiable Credentials
- [ ] Webhook system
- [ ] Scheduled reports
- [ ] Bulk operations
- [ ] Data retention policies

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Uptime | 99.9% | Excludes maintenance windows |
| Response time (p95) | <500ms | API endpoints |
| Response time (AI) | <5s | First token |
| Concurrent users | 10,000 per tenant | Scalable horizontally |
| Tenant limit | Unlimited | Shared-nothing where possible |
| Accessibility | WCAG 2.1 AA | Required for education sector |
| Mobile support | Responsive | Tailwind breakpoints |
| Browser support | Last 2 versions | Chrome, Firefox, Safari, Edge |

## 5. Constraints
- Existing codebase is brownfield — refactor, don't rewrite
- Monorepo with pnpm workspaces
- Frontend: Next.js 15 + Tailwind + shadcn/ui
- Backend: NestJS + PostgreSQL + Redis
- AI: Provider-agnostic (DeepSeek default)
- Deployment: Vercel (frontend) + Railway (backend/Docker)
