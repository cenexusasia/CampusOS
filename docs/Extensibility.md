# CampusOS — Extensibility Architecture

## Design Principle
CampusOS is a **platform**, not a monolithic application. Everything is designed to be extended without modifying core code.

```
CORE (stable, rarely changed)
├── Auth (JWT, tenants, RBAC)
├── Prisma (database layer)
├── Queue (BullMQ/Redis)
└── Router (global prefix /api/v1)

MODULES (add/remove independently)
├── Knowledge Base
├── AI Agents
├── Connectors*
├── Courses
├── Students
└── Analytics

PLUGINS (third-party, loaded dynamically*)
├── moodle-connector*
├── open-sis-connector*
├── erpnext-connector*
└── google-workspace*

* = extensibility targets
```

---

## 1. Connector SDK

### Interface
Every connector implements the same contract:

```typescript
interface ConnectorPlugin {
  /** Unique provider key (e.g. 'moodle', 'erpnext') */
  provider: string;
  
  /** Human-readable name */
  name: string;
  
  /** Supported sync types */
  capabilities: {
    sync: boolean;        // Full data sync
    webhook: boolean;     // Real-time events
    oauth: boolean;       // OAuth-based auth
    basicAuth: boolean;   // Username/password
    apiKey: boolean;      // API key auth
  };

  /** Connect: validate credentials, return connection ID */
  connect(config: ConnectorConfig): Promise<ConnectionResult>;

  /** Sync: pull data from external system */
  sync(connectionId: string, options?: SyncOptions): Promise<SyncResult>;

  /** Disconnect: clean up */
  disconnect(connectionId: string): Promise<void>;

  /** List: get current connection status */
  list(tenantId: string): Promise<ConnectorStatus[]>;
}
```

### Current Connectors
| Provider | Type | Status | Interface |
|----------|------|--------|-----------|
| Moodle | MySQL direct | ✅ | ConnectorPlugin |
| OpenSIS | MySQL direct | ✅ | ConnectorPlugin |
| Google | OAuth stub | 🔶 Partial | ConnectorPlugin |

### How to Add a New Connector
1. Create new directory: `apps/api/src/modules/connectors/{provider}/
2. Implement `ConnectorPlugin` interface
3. Create NestJS module with controller + service
4. Register in `ConnectorsModule`
5. Frontend card auto-discovered via `GET /api/v1/connectors` endpoint

---

## 2. Plugin System

### Current Approach: NestJS Module Registration
Plugins are NestJS modules registered in `app.module.ts`. This works but is not dynamic.

### Future: Dynamic Plugin Loader (Sprint 4+)
```typescript
// plugins.json — in database or file system
{
  "plugins": [
    { "name": "erpnext", "path": "./plugins/erpnext", "enabled": true },
    { "name": "crm", "path": "./plugins/crm", "enabled": true }
  ]
}
```

The plugin loader:
1. Reads plugin manifest at startup
2. Dynamically imports and registers modules
3. Exposes plugin routes under `/api/v1/plugins/{name}/*`
4. Provides plugin lifecycle hooks: onEnable, onDisable, onSync

### Plugin Package Structure
```
plugins/
├── {plugin-name}/
│   ├── package.json       — Dependencies specific to this plugin
│   ├── manifest.json      — Plugin metadata (name, version, hooks)
│   ├── src/
│   │   ├── index.ts       — Entry point, implements PluginInterface
│   │   ├── controller.ts  — API routes
│   │   ├── service.ts     — Business logic
│   │   └── types.ts       — TypeScript types
│   └── README.md          — Plugin documentation
```

### Plugin Manifest (manifest.json)
```json
{
  "name": "erpnext",
  "version": "1.0.0",
  "description": "ERPNext connector for finance and HR",
  "entry": "./src/index.ts",
  "hooks": {
    "onEnable": "handleEnable",
    "onDisable": "handleDisable",
    "onSync": "handleSync"
  },
  "permissions": ["courses:read", "students:read", "financial:write"],
  "routes": [
    { "path": "/api/v1/erp/sync", "method": "POST" },
    { "path": "/api/v1/erp/invoices", "method": "GET" }
  ]
}
```

---

## 3. Module Registry

### Current State
Modules are hardcoded in `app.module.ts`. Adding a module requires editing this file.

### Future: Auto-Discovery
```typescript
// Proposed: ModuleRegistry scans directories
@Module({
  imports: [
    ...ModuleRegistry.scan('./modules'),  // Auto-discovers all modules
    ...PluginLoader.load('./plugins'),     // Loads enabled plugins
  ],
})
```

### Module Discovery Rules
1. Scan `apps/api/src/modules/` for directories with `*.module.ts`
2. Each module can declare dependencies on other modules
3. Modules can provide extension points (hooks, events, providers)
4. Ordering is determined by dependency graph (topological sort)

---

## 4. Event System

### Current: Direct Service Calls
Modules call each other directly via NestJS DI. Works but creates tight coupling.

### Future: Event Bus (BullMQ-based)
```typescript
// Event types
events.emit('course.created', { courseId: '...', tenantId: '...' });
events.emit('student.enrolled', { studentId: '...', courseId: '...' });
events.emit('sync.completed', { provider: 'moodle', stats: {...} });

// Event listeners (any module can subscribe)
@OnEvent('course.created')
handleCourseCreated(payload: CourseCreatedEvent) {
  // Notify, sync, index, etc.
}
```

### Event Types (Planned)
| Event | Triggered By | Consumed By |
|-------|-------------|-------------|
| course.created | CoursesModule | Search index, webhooks |
| student.enrolled | CoursesModule | Analytics, notifications |
| knowledge.uploaded | KnowledgeModule | Embedding generation, search |
| connector.synced | ConnectorsModule | Analytics, audit log |
| agent.executed | AgentsModule | Audit log, notifications |

---

## 5. Webhook System

### Purpose
Allow external systems to subscribe to CampusOS events.

### Endpoints
```
POST /api/v1/webhooks/register  → Register a webhook URL
DELETE /api/v1/webhooks/:id     → Remove webhook
GET /api/v1/webhooks            → List registered webhooks
```

### Integration with Event Bus
```typescript
// When an event fires, check for registered webhooks
async function dispatchWebhooks(event: string, payload: any) {
  const webhooks = await prisma.webhook.findMany({
    where: { event, tenantId: payload.tenantId, active: true }
  });
  
  for (const webhook of webhooks) {
    await queueService.addJob('webhook-delivery', {
      url: webhook.url,
      secret: webhook.secret,
      event,
      payload,
    });
  }
}
```

---

## 6. UI Extensibility

### Current: Static Routes
All pages are hardcoded in `apps/web/src/app/(portal)/`.

### Future: Dynamic Sidebar
```typescript
// Plugin-provided sidebar items
registerSidebarItem({
  label: 'ERP Dashboard',
  icon: FileText,
  href: '/plugins/erp',
  permissions: ['financial:read'],
  plugin: 'erpnext',
});
```

### Component Slots
| Slot | Purpose | Used By |
|------|---------|---------|
| sidebar-bottom | Plugin navigation items | All plugins |
| dashboard-widgets | Custom dashboard cards | Analytics, AI |
| settings-tabs | Plugin configuration | Connectors |
| knowledge-toolbar | Custom document actions | OCR, translation |

---

## 7. API Extensibility

### Route Prefixes
- Core API: `/api/v1/{module}/*`
- Plugin API: `/api/v1/plugins/{plugin-name}/*`
- Webhooks: `/api/v1/webhooks/*`

### Response Envelope
All API responses follow the same format:
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## Extensibility Roadmap

| Feature | Sprint | Effort | Dependency |
|---------|--------|--------|------------|
| Connector SDK docs + pattern | Current | 1 day | Existing connectors |
| Event Bus (BullMQ) | Sprint 3 | 3 days | BullMQ + Redis |
| Webhook system | Sprint 3 | 3 days | Event Bus |
| Plugin loader (dynamic) | Sprint 4 | 5 days | Event Bus |
| UI extensibility | Sprint 4 | 3 days | Plugin loader |
| Plugin marketplace | Sprint 5 | 8 days | Plugin loader |

## Key Decisions

| Decision | Rationale | 
|----------|-----------|
| Connectors implement an interface, not extend a base class | TypeScript interfaces are sufficient; no runtime overhead |
| Plugins are NestJS modules, not standalone services | Shared runtime, same DI container, simpler deployment |
| Events use BullMQ queues, not in-process pub/sub | Durable delivery survives restarts |
| Webhooks delivered via BullMQ workers | Retry logic, rate limiting, dead letter queues |
| UI extensions via component slots, not iframes | Smoother UX, shared design system |
