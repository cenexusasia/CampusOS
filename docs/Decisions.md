# CampusOS — Decision Log

| # | Date | Decision | Rationale | Author |
|---|------|----------|-----------|--------|
| 001 | 2026-07-08 | Monorepo with pnpm workspaces | Shared types, single lockfile, parallel builds | CTO |
| 002 | 2026-07-08 | API as container (Railway) | NestJS requires persistent process | CTO |
| 003 | 2026-07-08 | Direct MySQL connectors | Moodle/OpenSIS REST APIs are incomplete | CTO |
| 004 | 2026-07-08 | DeepSeek as default AI provider | 10x cheaper than GPT-4, competitive quality | CTO |
| 005 | 2026-07-08 | No vector DB yet (keyword search first) | Lower complexity, pgvector ready when needed | CTO |
| 006 | 2026-07-08 | Brownfield over greenfield | Existing codebase is 6,000+ lines and functional | CTO |
| 007 | 2026-07-08 | Deploy from apps/api/deploy/ (npm, not pnpm) | Railway Nixpacks doesn't support pnpm well | CTO |
| 008 | 2026-07-08 | Pre-built dist in git (deploy/) | Avoids TypeScript compilation on Railway | CTO |
| 009 | 2026-07-08 | Supabase Session Pooler | Prisma compatibility vs. Transaction Pooler | CTO |
| 010 | 2026-07-08 | Cloudflare Tunnel for local systems | ngrok blocked by Windows Defender | CTO |
