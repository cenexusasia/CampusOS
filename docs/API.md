# CampusOS — API Reference

## Base URLs
- **Production:** `https://campusos-api-production-25ac.up.railway.app/api/v1`
- **Local:** `http://localhost:3001/api/v1`

## Authentication
All protected endpoints require `Authorization: Bearer <accessToken>` header.

### POST /auth/register
Create a new user + tenant (first user becomes tenant owner).
```json
// Request
{ "email": "demo@campusos.com", "password": "Demo123!", "name": "Demo User" }

// Response 201
{ "user": { "id": "...", "email": "...", "name": "..." }, "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 } }
```

### POST /auth/login
```json
// Request
{ "email": "demo@campusos.com", "password": "Demo123!" }

// Response 200
{ "user": { ... }, "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 } }
```

### POST /auth/refresh
```json
// Request
{ "refreshToken": "..." }

// Response 200
{ "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
```

### POST /auth/logout (Protected)
```json
// Request
{ "refreshToken": "..." }

// Response 200
{ "message": "Logged out successfully" }
```

## Health

### GET /health
```json
{ "status": "ok", "version": "0.1.0", "uptime": 3600 }
```

## Users (Protected)

### GET /users
```json
// Response
[{ "id": "...", "email": "...", "name": "...", "role": "TENANT_ADMIN" }]
```

### GET /users/:id
### PATCH /users/:id
### DELETE /users/:id

## Tenants (Protected)

### GET /tenants/:id
### PATCH /tenants/:id
### POST /tenants/:id/invite
```json
{ "email": "user@example.com", "role": "MEMBER" }
```

## AI (Protected)

### POST /ai/chat
```json
// Request
{ "messages": [{ "role": "user", "content": "Hello" }], "model": "deepseek-chat" }

// Response 200
{ "content": "Kumusta!", "finishReason": "stop", "usage": { "promptTokens": 8, "completionTokens": 26, "totalTokens": 34 } }
```

## Courses (Protected)

### GET /courses
### POST /courses
### GET /courses/:id
### PATCH /courses/:id
### DELETE /courses/:id

## Students (Protected)

### GET /students
### POST /students
### GET /students/:id
### PATCH /students/:id
### DELETE /students/:id

## Analytics (Protected)

### GET /analytics/overview
### GET /analytics/enrollments
### GET /analytics/performance
### GET /analytics/trends

## Connectors (Protected)

### GET /connectors
List all configured connectors for the tenant.

### POST /connectors/moodle/connect
Connect to Moodle instance.
```json
{ "host": "localhost", "port": 3306, "database": "moodle", "username": "...", "password": "..." }
```

### POST /connectors/moodle/:id/sync
Trigger data sync.
### DELETE /connectors/:provider/:id
Disconnect.

## Error Format
```json
{ "statusCode": 401, "message": "Unauthorized", "error": "Unauthorized" }
```

## Planned Routes

### POST /knowledge/upload
### POST /knowledge/search
### GET /knowledge/documents
### DELETE /knowledge/documents/:id
