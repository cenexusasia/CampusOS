# CampusOS — Deployment Guide

## Architecture
```
Frontend:  Vercel (Edge Network) → https://campusos-nu.vercel.app
Backend:   Railway (Container)   → https://campusos-api-production-25ac.up.railway.app
Database:  Supabase (PostgreSQL) → Session Pooler connection
AI:        DeepSeek API          → api.deepseek.com
Local:     Moodle + OpenSIS      → Cloudflare Tunnel
```

## Frontend (Vercel)

### Build Configuration
- **Root directory:** `apps/web`
- **Framework:** Next.js
- **Build command:** `npm install && npm run build`
- **Output directory:** `.next`
- **Node version:** 22.x

### Environment Variables (Vercel)
| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_API_URL | https://campusos-api-production-25ac.up.railway.app |
| AUTH_URL | https://campusos-api-production-25ac.up.railway.app |
| AUTH_SECRET | (generated) |
| NEXT_PUBLIC_SUPABASE_URL | (from Supabase) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (from Supabase) |

### Deploy
```bash
cd /g/AntiGravity-Dev/products/CampusOS
pnpm build --filter=@campusos/web
git add -A && git commit -m "..." && git push
vercel --prod --yes --force
```

## Backend (Railway)

### Build Configuration
- **Root directory:** `apps/api/deploy/`
- **Build command:** `npm install && prisma generate` (no TypeScript compilation)
- **Start command:** `node start.cjs`
- **Pre-built dist** in `apps/api/deploy/dist/` (committed to git)

### Nixpacks
Railway uses Nixpacks (not Dockerfile). Config in `apps/api/deploy/nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["..."]
cmds = ["npm install --no-frozen-lockfile"]
```

### Environment Variables (Railway)
| Variable | Value |
|----------|-------|
| DATABASE_URL | postgresql://postgres.{project}:{password}@pooler.supabase.com:5432/postgres?sslmode=require |
| JWT_SECRET | campusos-jwt-secret-2026 |
| JWT_REFRESH_SECRET | campusos-jwt-refresh-secret-2026 |
| NEXT_PUBLIC_APP_URL | https://campusos-nu.vercel.app |
| NODE_ENV | production |
| PORT | 3001 |
| DEEPSEEK_API_KEY | sk-216abaae29064182af776144aed845e3 |

### Deploy
```bash
cd /g/AntiGravity-Dev/products/CampusOS/apps/api/deploy
railway up --yes -d
railway variable set "KEY=VALUE" ...
```

### Manual Redeploy
```bash
railway service redeploy --service campusos-api --yes
```

## Docker

### Local Development
```bash
docker compose up -d
```

### Dockerfile (apps/api)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY deploy/package*.json ./
RUN npm ci
COPY deploy/ ./
EXPOSE 3001
CMD ["node", "start.cjs"]
```

## Database (Supabase)

### Connection
Use Session Pooler string (not Transaction Pooler) for Prisma compatibility:
```
DATABASE_URL=postgresql://postgres.{project}:{password}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### Migrations
```bash
cd apps/api
npx prisma migrate dev --name <migration_name>
npx prisma migrate deploy  # Production
```

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 10+
- PostgreSQL (or Supabase cloud)

### Setup
```bash
cd /g/AntiGravity-Dev/products/CampusOS
pnpm install
pnpm approve-builds
cp apps/api/.env.example apps/api/.env  # Edit as needed
pnpm build
cd apps/api && npx prisma db push
```

### Run
```bash
cd apps/api && npx nest start --watch
cd apps/web && pnpm dev
```

## Monitoring (Planned)
- OpenTelemetry for distributed tracing
- Railway built-in logs and metrics
- Vercel Analytics for frontend
- Custom health check endpoint `/api/v1/health`
