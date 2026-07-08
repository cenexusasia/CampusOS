# CampusOS — Decision Log

| # | Date | Decision | Rationale | Status |
|---|------|----------|-----------|--------|
| 001 | 2026-07-08 | Monorepo with pnpm workspaces | Shared types, single lockfile, parallel builds | ✅ Active |
| 002 | 2026-07-08 | API as container (Railway) | NestJS requires persistent process | ✅ Active |
| 003 | 2026-07-08 | Direct MySQL connectors | Moodle/OpenSIS REST APIs are incomplete | ✅ Active |
| 004 | 2026-07-08 | DeepSeek as default AI provider | 10x cheaper than GPT-4, competitive quality | ✅ Active |
| 005 | 2026-07-08 | ~~No vector DB~~ → **pgvector adopted** | Semantic search now in production | 🔄 Updated |
| 006 | 2026-07-08 | Brownfield over greenfield | Existing codebase 6,000+ lines and functional | ✅ Active |
| 007 | 2026-07-08 | Deploy from apps/api/deploy/ (npm) | Railway Nixpacks doesn't support pnpm | ✅ Active |
| 008 | 2026-07-08 | Pre-built dist in git (deploy/) | Avoids TypeScript compilation on Railway | ✅ Active |
| 009 | 2026-07-08 | Supabase Session Pooler | Prisma compatibility vs. Transaction Pooler | ✅ Active |
| 010 | 2026-07-08 | Cloudflare Tunnel for local systems | ngrok blocked by Windows Defender | ✅ Active |
| 011 | 2026-07-08 | BullMQ + Redis for job queues | Async processing with graceful fallback | ✅ Active |
| 012 | 2026-07-08 | AI Agents (synchronous, tool-based) | Simpler than async for current needs | ✅ Active |
