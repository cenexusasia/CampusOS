# CampusOS — Database Design

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2026-07-06

---

## 1. Database Technology

- **Primary:** PostgreSQL 16 with pgvector extension
- **ORM:** Prisma (Type-safe, auto-generated types, migrations)
- **Connection Pooling:** PgBouncer (via connection string in Prisma)
- **Migrations:** Prisma Migrate

---

## 2. Multi-Tenant Strategy

**Hybrid approach:**
- **`public` schema** — Global data (platform users, tenants, plans, features)
- **Schema-per-tenant** (`tenant_{id}`) — Sensitive domain data per institution
- **Row-level tenant_id** — Shared reference data (connectors, workflows, AI configs)

### Schema Resolution
```
Request → Tenant Header → Prisma Middleware → Schema Switch → Query
```

---

## 3. Entity Relationship Diagram (Textual)

```
                            ┌──────────────────────┐
                            │       Tenant         │
                            │──────────────────────│
                            │ id (PK)              │──┐
                            │ name                 │  │
                            │ slug                 │  │
                            │ domain               │  │
                            │ plan_id (FK)         │──┼──┐
                            │ status               │  │  │
                            │ settings (JSONB)     │  │  │
                            │ created_at           │  │  │
                            └──────────────────────┘  │  │
                                                      │  │
            ┌──────────────────────┐                  │  │
            │        Plan         │                  │  │
            │──────────────────────│                  │  │
            │ id (PK)             │◄─────────────────┘  │
            │ name                │                     │
            │ price               │                     │
            │ features (JSONB)    │                     │
            │ max_users           │                     │
            │ max_connectors      │                     │
            │ max_storage_mb      │                     │
            │ ai_credits_monthly  │                     │
            │ created_at          │                     │
            └──────────────────────┘                   │
                                                       │
            ┌──────────────────────┐                   │
            │       User          │                   │
            │──────────────────────│                   │
            │ id (PK)             │                   │
            │ email               │                   │
            │ name                │                   │
            │ password_hash       │                   │
            │ status              │                   │
            │ created_at          │                   │
            └──────────────────────┘                   │
                    │                                  │
                    │ (many-to-many via membership)    │
                    ▼                                  │
            ┌──────────────────────┐                   │
            │   TenantMembership  │                   │
            │──────────────────────│                   │
            │ id (PK)             │                   │
            │ user_id (FK)        │                   │
            │ tenant_id (FK)      │───────────────────┘
            │ role                │  # owner, admin, member
            │ permissions (JSONB) │
            │ joined_at           │
            └──────────────────────┘
                    │
                    │
┌───────────────────────────────────────────────────────────────────────────┐
│                    TENANT SCHEMA (tenant_{id})                           │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │     ConnectorInst    │  │   ConnectorConfig    │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ tenant_id            │  │ connector_id (FK)    │                     │
│  │ connector_type       │──│ key                  │                     │
│  │ status               │  │ value (encrypted)    │                     │
│  │ sync_schedule        │  │ created_at           │                     │
│  │ last_sync_at         │  └──────────────────────┘                     │
│  │ created_at           │                                               │
│  └──────────┬───────────┘                                               │
│             │ (one connector → many syncs)                              │
│             ▼                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │     SyncLog          │  │    CachedData        │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ connector_id (FK)    │  │ connector_id (FK)    │                     │
│  │ status               │  │ resource_type        │                     │
│  │ started_at           │  │ data (JSONB)         │                     │
│  │ completed_at         │  │ last_synced_at       │                     │
│  │ records_processed    │  │ checksum             │                     │
│  │ error_message        │  └──────────────────────┘                     │
│  └──────────────────────┘                                               │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │   Workflow           │  │   WorkflowTrigger    │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ name                 │──│ workflow_id (FK)      │                     │
│  │ description          │  │ type (cron/event/web)│                     │
│  │ status               │  │ config (JSONB)       │                     │
│  │ tenant_id            │  │ created_at           │                     │
│  │ created_at           │  └──────────────────────┘                     │
│  └──────────┬───────────┘                                               │
│             ▼                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │  WorkflowStep        │  │   WorkflowAction     │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ workflow_id (FK)     │  │ step_id (FK)         │                     │
│  │ order                │──│ type                 │                     │
│  │ type                 │  │ config (JSONB)       │                     │
│  │ config (JSONB)       │  │ created_at           │                     │
│  │ created_at           │  └──────────────────────┘                     │
│  └──────────────────────┘                                               │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │   AIConversation     │  │    AIMessage          │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ tenant_id            │  │ conversation_id (FK) │                     │
│  │ user_id              │──│ role (user/assistant) │                     │
│  │ title                │  │ content (text)        │                     │
│  │ context (JSONB)      │  │ metadata (JSONB)      │                     │
│  │ created_at           │  │ tokens_used           │                     │
│  │ updated_at           │  │ created_at            │                     │
│  └──────────────────────┘  └──────────────────────┘                     │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │   Document           │  │   DocumentChunk      │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ tenant_id            │  │ document_id (FK)     │                     │
│  │ title                │──│ content (text)        │                     │
│  │ type                 │  │ embedding (vector)    │  # pgvector
│  │ file_path            │  │ chunk_index           │                     │
│  │ metadata (JSONB)     │  │ metadata (JSONB)      │                     │
│  │ created_at           │  │ created_at            │                     │
│  └──────────────────────┘  └──────────────────────┘                     │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │   Notification       │  │     AuditEvent       │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ tenant_id            │  │ tenant_id            │                     │
│  │ user_id (FK)         │  │ user_id              │                     │
│  │ type                 │  │ action               │                     │
│  │ channel              │  │ resource_type        │                     │
│  │ subject              │  │ resource_id          │                     │
│  │ body                 │  │ details (JSONB)      │                     │
│  │ read_at              │  │ ip_address           │                     │
│  │ created_at           │  │ user_agent           │                     │
│  └──────────────────────┘  │ created_at           │                     │
│                             └──────────────────────┘                     │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │  DashboardWidget     │  │     AIUsageLog       │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ tenant_id            │  │ tenant_id            │                     │
│  │ user_id              │  │ user_id              │                     │
│  │ widget_type          │  │ provider             │                     │
│  │ config (JSONB)       │  │ model                │                     │
│  │ position             │  │ prompt_tokens        │                     │
│  │ created_at           │  │ completion_tokens    │                     │
│  └──────────────────────┘  │ cost_usd             │                     │
│                             │ created_at           │                     │
│                             └──────────────────────┘                     │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │   KnowledgeArticle   │  │ KnowledgeCategory    │                     │
│  │──────────────────────│  │──────────────────────│                     │
│  │ id (PK)              │  │ id (PK)              │                     │
│  │ tenant_id            │  │ tenant_id            │                     │
│  │ category_id (FK)     │──│ name                 │                     │
│  │ title                │  │ slug                 │                     │
│  │ content (text)       │  │ description          │                     │
│  │ status               │  │ parent_id (self-ref) │                     │
│  │ tags (text[])        │  │ created_at           │                     │
│  │ created_at           │  └──────────────────────┘                     │
│  │ updated_at           │                                               │
│  └──────────────────────┘                                               │
│                                                                          │
│  ┌──────────────────────┐                                               │
│  │   BillingInvoice     │                                               │
│  │──────────────────────│                                               │
│  │ id (PK)              │                                               │
│  │ tenant_id            │                                               │
│  │ stripe_invoice_id    │                                               │
│  │ amount               │                                               │
│  │ currency             │                                               │
│  │ status               │                                               │
│  │ period_start         │                                               │
│  │ period_end           │                                               │
│  │ paid_at              │                                               │
│  │ created_at           │                                               │
│  └──────────────────────┘                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Indexing Strategy

### 4.1 Primary Indexes
```sql
-- Global tables
CREATE INDEX idx_tenant_slug ON "Tenant"(slug);
CREATE INDEX idx_tenant_domain ON "Tenant"(domain);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_membership_user ON "TenantMembership"(user_id);
CREATE INDEX idx_membership_tenant ON "TenantMembership"(tenant_id);

-- Tenant-scoped tables
CREATE INDEX idx_connector_tenant ON "ConnectorInst"(tenant_id);
CREATE INDEX idx_sync_connector ON "SyncLog"(connector_id);
CREATE INDEX idx_workflow_tenant ON "Workflow"(tenant_id);
CREATE INDEX idx_conversation_user ON "AIConversation"(user_id);
CREATE INDEX idx_message_conversation ON "AIMessage"(conversation_id);
CREATE INDEX idx_notification_user ON "Notification"(user_id, read_at);
CREATE INDEX idx_audit_tenant ON "AuditEvent"(tenant_id, created_at);
CREATE INDEX idx_audit_user ON "AuditEvent"(user_id);
CREATE INDEX idx_document_tenant ON "Document"(tenant_id);
```

### 4.2 Vector Index (pgvector)
```sql
-- IVFFlat index for approximate nearest neighbor search on document embeddings
CREATE INDEX idx_document_chunk_embedding ON "DocumentChunk" 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### 4.3 Full-Text Search Indexes
```sql
CREATE INDEX idx_knowledge_fts ON "KnowledgeArticle" 
  USING gin(to_tsvector('english', title || ' ' || content));
```

---

## 5. Partitioning Strategy

### 5.1 Audit Events (By Month)
```sql
CREATE TABLE "AuditEvent" (
  -- ...
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE "AuditEvent_2026_01" PARTITION OF "AuditEvent"
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 5.2 Sync Logs (By Month)
Same strategy as audit events — high-volume append-only data.

---

## 6. Prisma Schema Highlights

```prisma
// Global Models (public schema)

model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  domain    String?
  planId    String?
  plan      Plan?    @relation(fields: [planId], references: [id])
  status    TenantStatus @default(ACTIVE)
  settings  Json?    @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships TenantMembership[]
  // Plus tenant-scoped models via raw queries
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String?
  image        String?
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  memberships TenantMembership[]
  accounts    Account[]    // Auth.js accounts
  sessions    Session[]    // Auth.js sessions
}

model TenantMembership {
  id          String   @id @default(cuid())
  userId      String
  tenantId    String
  role        MembershipRole @default(MEMBER)
  permissions Json?    @default("[]")
  joinedAt    DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([userId, tenantId])
}
```

---

## 7. Data Migration Strategy

- **Prisma Migrate** for schema changes in development
- **Database per branch** in CI/CD (spin up temporary DB, run migrations, run tests)
- **Rollback scripts** for each migration (down.sql)
- **Zero-downtime migrations** via expand-migrate-contract pattern:
  1. Expand: Add new columns/tables (app handles both old and new)
  2. Migrate: Backfill data in batches
  3. Contract: Remove old columns (after verification)
