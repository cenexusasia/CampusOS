# CampusOS — Database Schema

## Technology
- **Primary:** PostgreSQL 16+ (Supabase Session Pooler)
- **ORM:** Prisma 6.x
- **Vector:** pgvector extension (future)
- **Extensions:** uuid-ossp, vector

## Connection
```
DATABASE_URL=postgresql://postgres.{project}:{password}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## Entity Relationship Summary

### Core Platform (10 models)
```
User ──┬── Account (OAuth providers)
       ├── Session (NextAuth)
       ├── TenantMembership ──┬── Tenant
       │                      ├── Plan
       └── VerificationToken
```

### Academic (6 models)
```
Course ──┬── Section
         ├── Department
         ├── CourseTagOnCourse ── CourseTag
         ├── CourseEnrollment ───── User
         └── SectionEnrollment ──── User
```

### AI (4 models)
```
AIConversation ──┬── AIMessage
AIProvider
Document ──┬── DocumentChunk
```

### Files & Storage (1 model)
```
FileUpload ── User
```

### Notifications (2 models)
```
Notification ──┬── User
NotificationSetting
```

### Operations (3 models)
```
Connector ── Tenant
AuditLog ── User
Schedule
Event
```

## Total: 26 Models

## Key Design Decisions

### Tenant Isolation
Every tenant-scoped table includes a `tenantId` field with an index. All queries MUST filter by `tenantId`. The `TenantMembership` model links users to tenants with a role.

### User Identity
Users are global (cross-tenant). A user can belong to multiple tenants with different roles. The `TenantMembership.role` determines what they can do within each tenant.

### Soft Deletes
All critical data uses `deletedAt: DateTime?` for soft deletes (not yet implemented — future).

### Migrations
Migrations live in `apps/api/prisma/migrations/`. Use `prisma migrate dev` for development. For production: `prisma migrate deploy`.

## Future Schema Changes

### Sprint 2: Add pgvector extension + embedding column to DocumentChunk
### Sprint 3: Add Connector config JSONB, Webhook model
### Sprint 3: Add ERP models (Invoice, PurchaseOrder, Employee)
### Sprint 3: Add CRM models (Lead, Contact, Deal)
### Sprint 4: Add RBAC models (Permission, RoleAssignment)
### Sprint 4: Add Session store for Redis-backed sessions
