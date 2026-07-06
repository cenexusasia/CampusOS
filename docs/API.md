# CampusOS — API Specification

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2026-07-06

---

## 1. API Design Principles

- **OpenAPI 3.1** specification
- **RESTful** resource-oriented endpoints
- **Versioned** via URL prefix (`/api/v1/`)
- **JSON** request/response bodies
- **Cursor-based pagination** for list endpoints
- **Standard error format** across all endpoints
- **Rate limited** per tenant + per user
- **Audit logged** for mutating operations

---

## 2. Base URL

```
Development:  http://localhost:4000/api/v1
Production:   https://api.campusos.com/api/v1
```

---

## 3. Authentication

All endpoints (except auth and health) require a Bearer JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer JWT token |
| `X-Tenant-Id` | Yes | Tenant/school identifier |
| `X-Idempotency-Key` | For mutations | Idempotency key for safe retries |
| `Accept-Language` | No | Locale preference (e.g., `en`, `es`) |

---

## 4. Standard Response Format

### Success
```json
{
  "data": { ... },
  "meta": {
    "page": { "cursor": "abc123", "nextCursor": "def456", "hasMore": true }
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "must be a valid email address" }
    ],
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 5. API Endpoints

### 5.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/logout` | Logout | Yes |
| POST | `/auth/refresh` | Refresh token | No (refresh token) |
| POST | `/auth/forgot-password` | Send password reset email | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/oauth/{provider}` | OAuth2/OIDC login | No |
| POST | `/auth/saml/{provider}/acs` | SAML assertion consumer | No |
| GET  | `/auth/me` | Get current user | Yes |
| PUT  | `/auth/me` | Update current user | Yes |
| POST | `/auth/mfa/setup` | Setup MFA | Yes |
| POST | `/auth/mfa/verify` | Verify MFA token | Yes |

### 5.2 Tenants

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tenants` | Create tenant (onboard school) | Yes (superadmin) |
| GET  | `/tenants` | List tenants | Yes (superadmin) |
| GET  | `/tenants/{id}` | Get tenant details | Yes (tenant admin) |
| PUT  | `/tenants/{id}` | Update tenant | Yes (tenant admin) |
| DELETE | `/tenants/{id}` | Delete tenant (soft) | Yes (superadmin) |
| GET  | `/tenants/{id}/stats` | Tenant usage statistics | Yes (tenant admin) |
| POST | `/tenants/{id}/suspend` | Suspend tenant | Yes (superadmin) |
| POST | `/tenants/{id}/activate` | Reactivate tenant | Yes (superadmin) |
| GET  | `/tenants/current` | Get current tenant context | Yes |

### 5.3 Users & Memberships

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/tenants/{id}/users` | List tenant users | Yes (admin) |
| POST | `/tenants/{id}/users` | Invite user to tenant | Yes (admin) |
| PUT  | `/tenants/{id}/users/{userId}` | Update user role/permissions | Yes (admin) |
| DELETE | `/tenants/{id}/users/{userId}` | Remove user from tenant | Yes (admin) |
| GET  | `/tenants/{id}/users/{userId}` | Get user details | Yes |

### 5.4 AI Chat

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/chat/conversations` | List conversations | Yes |
| POST | `/chat/conversations` | Create conversation | Yes |
| GET  | `/chat/conversations/{id}` | Get conversation | Yes |
| DELETE | `/chat/conversations/{id}` | Delete conversation | Yes |
| GET  | `/chat/conversations/{id}/messages` | List messages | Yes |
| POST | `/chat/conversations/{id}/messages` | Send message (streaming) | Yes |
| PUT  | `/chat/conversations/{id}/title` | Update conversation title | Yes |

### 5.5 AI Orchestrator (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/ai/providers` | List configured providers | Yes (admin) |
| POST | `/ai/providers` | Add AI provider | Yes (admin) |
| PUT  | `/ai/providers/{id}` | Update provider config | Yes (admin) |
| DELETE | `/ai/providers/{id}` | Remove provider | Yes (admin) |
| GET  | `/ai/models` | List available models | Yes (admin) |
| POST | `/ai/models/test` | Test model connection | Yes (admin) |
| GET  | `/ai/usage` | Get AI usage stats | Yes (admin) |
| POST | `/ai/prompts` | Create prompt template | Yes (admin) |
| GET  | `/ai/prompts` | List prompt templates | Yes (admin) |
| PUT  | `/ai/prompts/{id}` | Update prompt template | Yes (admin) |
| DELETE | `/ai/prompts/{id}` | Delete prompt template | Yes (admin) |

### 5.6 Integration Gateway

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/integrations/connectors` | List installed connectors | Yes |
| POST | `/integrations/connectors` | Install connector | Yes (admin) |
| GET  | `/integrations/connectors/{id}` | Get connector details | Yes |
| PUT  | `/integrations/connectors/{id}/config` | Update connector config | Yes (admin) |
| POST | `/integrations/connectors/{id}/sync` | Trigger sync | Yes (admin) |
| GET  | `/integrations/connectors/{id}/syncs` | List sync history | Yes |
| DELETE | `/integrations/connectors/{id}` | Uninstall connector | Yes (admin) |
| GET  | `/integrations/connectors/available` | List available connectors | Yes |
| GET  | `/integrations/connectors/{id}/health` | Check connector health | Yes |
| GET  | `/integrations/resources/{connectorId}` | List connector resources | Yes |

### 5.7 Workflow Engine

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/workflows` | List workflows | Yes |
| POST | `/workflows` | Create workflow | Yes (admin) |
| GET  | `/workflows/{id}` | Get workflow details | Yes |
| PUT  | `/workflows/{id}` | Update workflow | Yes (admin) |
| DELETE | `/workflows/{id}` | Delete workflow | Yes (admin) |
| POST | `/workflows/{id}/activate` | Activate workflow | Yes (admin) |
| POST | `/workflows/{id}/deactivate` | Deactivate workflow | Yes (admin) |
| GET  | `/workflows/{id}/executions` | List workflow executions | Yes |
| POST | `/workflows/{id}/test` | Test workflow execution | Yes (admin) |
| GET  | `/workflows/executions/{id}` | Get execution details | Yes |

### 5.8 Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/dashboard/widgets` | List user's widgets | Yes |
| POST | `/dashboard/widgets` | Add widget | Yes |
| PUT  | `/dashboard/widgets/{id}` | Update widget config | Yes |
| DELETE | `/dashboard/widgets/{id}` | Remove widget | Yes |
| PUT  | `/dashboard/layout` | Save dashboard layout | Yes |
| GET  | `/dashboard/overview` | Get dashboard overview data | Yes |
| GET  | `/dashboard/executive` | Executive dashboard data | Yes (admin) |

### 5.9 Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/analytics/reports` | List saved reports | Yes |
| POST | `/analytics/reports` | Create report | Yes |
| GET  | `/analytics/reports/{id}` | Get report | Yes |
| PUT  | `/analytics/reports/{id}` | Update report | Yes |
| DELETE | `/analytics/reports/{id}` | Delete report | Yes |
| POST | `/analytics/reports/{id}/execute` | Execute report | Yes |
| POST | `/analytics/reports/{id}/export` | Export report (PDF/CSV) | Yes |
| GET  | `/analytics/reports/scheduled` | List scheduled reports | Yes |
| POST | `/analytics/reports/scheduled` | Schedule report delivery | Yes |

### 5.10 Knowledge Base

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/knowledge/articles` | List articles | Yes |
| POST | `/knowledge/articles` | Create article | Yes |
| GET  | `/knowledge/articles/{id}` | Get article | Yes |
| PUT  | `/knowledge/articles/{id}` | Update article | Yes |
| DELETE | `/knowledge/articles/{id}` | Delete article | Yes |
| GET  | `/knowledge/categories` | List categories | Yes |
| POST | `/knowledge/categories` | Create category | Yes (admin) |
| PUT  | `/knowledge/categories/{id}` | Update category | Yes (admin) |
| DELETE | `/knowledge/categories/{id}` | Delete category | Yes (admin) |
| GET  | `/knowledge/search` | Search knowledge base | Yes |

### 5.11 Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/notifications` | List notifications | Yes |
| GET  | `/notifications/{id}` | Get notification | Yes |
| PUT  | `/notifications/{id}/read` | Mark as read | Yes |
| POST | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/{id}` | Delete notification | Yes |
| GET  | `/notifications/preferences` | Get notification preferences | Yes |
| PUT  | `/notifications/preferences` | Update preferences | Yes |
| GET  | `/notifications/templates` | List notification templates | Yes (admin) |
| POST | `/notifications/templates` | Create template | Yes (admin) |
| PUT  | `/notifications/templates/{id}` | Update template | Yes (admin) |

### 5.12 Audit Logs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/audit/events` | List audit events | Yes (admin) |
| GET  | `/audit/events/{id}` | Get event details | Yes (admin) |
| GET  | `/audit/export` | Export audit log | Yes (superadmin) |
| GET  | `/audit/stats` | Audit summary stats | Yes (admin) |

### 5.13 Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/billing/plans` | List subscription plans | Yes |
| GET  | `/billing/current` | Get current subscription | Yes (admin) |
| POST | `/billing/checkout` | Create checkout session | Yes (admin) |
| POST | `/billing/cancel` | Cancel subscription | Yes (admin) |
| GET  | `/billing/invoices` | List invoices | Yes (admin) |
| GET  | `/billing/invoices/{id}` | Get invoice details | Yes (admin) |
| GET  | `/billing/usage` | Get usage metering data | Yes (admin) |
| POST | `/billing/webhook` | Stripe webhook | No (webhook) |

### 5.14 Marketplace

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/marketplace/connectors` | List available connectors | Yes |
| GET  | `/marketplace/connectors/{id}` | Get connector details | Yes |
| POST | `/marketplace/install/{id}` | Install from marketplace | Yes (admin) |
| GET  | `/marketplace/categories` | List marketplace categories | Yes |

### 5.15 Connector Implementations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/connectors/moodle/courses` | List Moodle courses | Yes |
| GET  | `/connectors/moodle/users` | List Moodle users | Yes |
| GET  | `/connectors/moodle/grades` | Get Moodle grades | Yes |
| POST | `/connectors/moodle/sync` | Sync Moodle data | Yes (admin) |
| GET  | `/connectors/opensis/students` | List OpenSIS students | Yes |
| GET  | `/connectors/opensis/attendance` | Get attendance data | Yes |
| GET  | `/connectors/orangehrm/employees` | List employees | Yes |
| GET  | `/connectors/erpnext/invoices` | List ERPNext invoices | Yes |
| GET  | `/connectors/m365/events` | List calendar events | Yes |
| GET  | `/connectors/google/calendar` | List Google Calendar events | Yes |
| GET  | `/connectors/vchainid/verify` | Verify credential via VChainID | Yes |

### 5.16 System & Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/health` | Health check | No |
| GET  | `/health/ready` | Readiness probe | No |
| GET  | `/health/live` | Liveness probe | No |
| GET  | `/system/version` | Get system version | No |
| GET  | `/system/features` | Get enabled features | Yes |

---

## 6. Pagination

All list endpoints use cursor-based pagination:

**Request:**
```
GET /api/v1/notifications?cursor=abc123&limit=20
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": {
      "cursor": "abc123",
      "nextCursor": "def456",
      "hasMore": true,
      "limit": 20
    }
  }
}
```

---

## 7. Rate Limiting

| Tier | Rate Limit | Burst |
|------|-----------|-------|
| Free | 100 req/min | 20 |
| Pro | 1000 req/min | 100 |
| Enterprise | 10000 req/min | 500 |
| AI endpoints | 20 req/min (Free), 100 req/min (Pro) | — |

Rate limit headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1625556000
```

---

## 8. WebSocket Events

For real-time features (notifications, AI streaming, dashboard updates):

```
ws://localhost:4000/ws?token={jwt}
```

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification:new` | Server→Client | New notification |
| `chat:message` | Server→Client | New AI chat message chunk |
| `chat:complete` | Server→Client | AI response complete |
| `dashboard:update` | Server→Client | Dashboard data refresh |
| `sync:progress` | Server→Client | Connector sync progress |
| `workflow:status` | Server→Client | Workflow execution status |
