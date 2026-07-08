# CampusOS — Security Architecture

## Principles
1. **Zero Trust** — No implicit trust; verify every request
2. **Least Privilege** — Users have minimum access needed
3. **Tenant Isolation** — Tenants cannot access each other's data
4. **Defense in Depth** — Multiple security layers
5. **Permission-aware AI** — AI never accesses unauthorized data

## Authentication

### Current: JWT-based
- `POST /api/v1/auth/register` — Create account + tenant
- `POST /api/v1/auth/login` — Returns accessToken (15min) + refreshToken (7d)
- `POST /api/v1/auth/refresh` — Rotate tokens
- `POST /api/v1/auth/logout` — Invalidate refresh token
- Passwords hashed with bcrypt (12 rounds)

### Planned: SSO / OIDC
- Support SAML, OIDC, OAuth2 providers
- Tenant-configurable identity providers
- Auto-provision users on first SSO login

### JWT Token Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenantId": "tenant-id",
  "role": "TENANT_ADMIN",
  "iat": 1234567890,
  "exp": 1234568790
}
```

## Authorization

### Current: JwtAuthGuard
- `@UseGuards(JwtAuthGuard)` on all protected routes
- Extracts user from JWT, attaches to request
- Controllers manually check tenant ownership

### Current: RolesGuard + PermissionsGuard
- `@Roles(UserRole.TENANT_ADMIN)` for role-based access
- `@Permissions('courses:write')` for fine-grained permissions
- Permissions decorator stores metadata, guard evaluates

### Planned: RBAC UI
- Visual role/permission management
- Custom role creation
- Per-tenant permission overrides

## Tenant Isolation

### Data Isolation
- All tenant-scoped tables have `tenantId` column
- `TenantMiddleware` extracts tenant from user context
- Services always filter by `tenantId`
- No cross-tenant queries in the codebase

### Attack Vectors Prevented
| Vector | Mitigation |
|--------|------------|
| IDOR (Insecure Direct Object Reference) | Tenant ID always from JWT, never from request params |
| SQL Injection | Prisma parameterized queries |
| JWT Tampering | RS256 signature verification |
| Session Hijacking | Short-lived access tokens, refresh rotation |

## API Security

### Headers (to add)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

### Rate Limiting (to add)
- Per-tenant: 1000 requests/minute
- Per-user: 100 requests/minute
- AI endpoints: 10 requests/minute per user
- Login: 5 attempts/minute per IP

### Current Gaps
| Issue | Severity | Fix |
|-------|----------|-----|
| Hardcoded DeepSeek API key in controller | 🔴 Critical | Move to Railway env var |
| No rate limiting | 🟡 Medium | Add @nestjs/throttler |
| No HTTPS enforcement header | 🟡 Medium | Add helmet middleware |
| No CSRF protection | 🟢 Low | SameSite cookies + CSRF token |
| API key logged in errors | 🟡 Medium | Sanitize error output |

## Data Protection

### At Rest
- Database passwords stored as Railway env vars
- JWT secrets stored as Railway env vars
- File uploads stored in local `uploads/` directory (not encrypted yet)

### In Transit
- HTTPS enforced by Vercel/Railway
- Supabase connection uses `sslmode=require`

### Secrets Management
| Secret | Location | Access |
|--------|----------|--------|
| DATABASE_URL | Railway env | Service only |
| JWT_SECRET | Railway env | Service only |
| DEEPSEEK_API_KEY | Railway env | Service only |
| Supabase keys | Vercel env + Railway env | Frontend + Backend |

## Audit Logging
- `AuditLog` model records: who, what, when, tenant, IP
- Tracked events: login, logout, data mutation, connector sync
- Logs are immutable (append-only in code)

## Permission-aware AI
- AI Chat responses should respect user's role and tenant
- Future: filter Knowledge Base search results by document permissions
- Future: AI Agents inherit user's permissions
