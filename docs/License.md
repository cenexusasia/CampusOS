# CampusOS — License Strategy & Compatibility

## Current Status
- **LICENSE file:** ❌ Missing
- **package.json license:** ❌ Not set
- **Deploy directory license:** ❌ Not set

---

## 1. Recommendation: AGPL-3.0-or-later

| Factor | AGPL v3 | Apache 2.0 | MIT | GPL v3 |
|--------|---------|------------|-----|--------|
| Copyleft | Strong | Weak | None | Strong |
| Network use = distribution | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Compatible with deps | ✅ | ✅ | ✅ | ⚠️ Partial |
| Commercial use allowed | ✅ | ✅ | ✅ | ✅ |
| Patent protection | ✅ | ✅ | ❌ | ✅ |
| Requires source disclosure | ✅ (if modified) | ❌ | ❌ | ✅ |

### Why AGPL-3.0?
1. **Network copyleft** — If CampusOS is run as a web service (it is), modifications must be shared. This protects against proprietary forks.
2. **Compatible with all current deps** — MIT, ISC, Apache-2.0, and BSD are all compatible with AGPL.
3. **Standard for AI/education platforms** — Moodle is GPL, Open edX is AGPL. AGPL aligns with the education sector's open values.
4. **Dual-licensing possible** — AGPL can be dual-licensed under commercial terms for enterprise customers who need proprietary extensions.

### Alternative: PolyForm Shield + AGPL Dual-License
For enterprise customers who want custom features without open-sourcing them, offer a commercial license alongside the AGPL open-source version.

---

## 2. Dependency License Compatibility Matrix

### Runtime Dependencies (apps/api)
| Package | License | AGPL Compatible | Notes |
|---------|---------|----------------|-------|
| @nestjs/core | MIT | ✅ Yes | |
| @prisma/client | Apache-2.0 | ✅ Yes | |
| bullmq | MIT | ✅ Yes | |
| ioredis | MIT | ✅ Yes | |
| ioredis | MIT | ✅ Yes | |
| @nestjs/jwt | MIT | ✅ Yes | |
| @nestjs/passport | MIT | ✅ Yes | |
| passport | MIT | ✅ Yes | |
| passport-jwt | MIT | ✅ Yes | |
| bcryptjs | MIT | ✅ Yes | |
| @nestjs/config | MIT | ✅ Yes | |
| @nestjs/serve-static | MIT | ✅ Yes | |
| zod | MIT | ✅ Yes | |
| pdf-parse | MIT | ✅ Yes | |
| mammoth | BSD-2-Clause | ✅ Yes | |
| uuid | MIT | ✅ Yes | |
| mysql2 | MIT | ✅ Yes | |
| nodemailer | MIT-0 | ✅ Yes | |

### Runtime Dependencies (apps/web)
| Package | License | AGPL Compatible | Notes |
|---------|---------|----------------|-------|
| next | MIT | ✅ Yes | |
| react | MIT | ✅ Yes | |
| next-auth | ISC | ✅ Yes | ISC ≈ MIT |
| tailwindcss | MIT | ✅ Yes | |
| @radix-ui/* | MIT | ✅ Yes | |
| lucide-react | ISC | ✅ Yes | |
| class-variance-authority | Apache-2.0 | ✅ Yes | |

### All 10 Recommended OSS Integrations
| Project | License | AGPL Compatible | Notes |
|---------|---------|----------------|-------|
| Authentik | MIT | ✅ Yes | For identity/SSO |
| Temporal | MIT | ✅ Yes | For workflow |
| Meilisearch | MIT | ✅ Yes | For search |
| Apache Tika | Apache-2.0 | ✅ Yes | For parsing |
| BullMQ (Redis) | MIT | ✅ Yes | Already integrated |
| pgvector | PostgreSQL | ✅ Yes | PostgreSQL license |
| LlamaIndex | MIT | ✅ Yes | For RAG |
| OpenTelemetry | Apache-2.0 | ✅ Yes | For monitoring |
| Grafana | AGPL-3.0 | ✅ Yes | Same license |
| Qdrant | Apache-2.0 | ✅ Yes | Vector DB alternative |

### ⚠️ Restrictions
| Restriction | Details |
|-------------|---------|
| AGPL v3 only | GPL v2-only packages are **not** compatible |
| Creative Commons | CC-NC (non-commercial) is **not** compatible |
| SSPL (MongoDB) | SSPL is **not** compatible with any GPL version |
| BSL (Business Source) | Time-limited; check for license change date |

---

## 3. Required License Headers

### Source Files
Add this header to every `.ts` file:

```typescript
// SPDX-FileCopyrightText: 2026 Web Solutions Inc.
// SPDX-License-Identifier: AGPL-3.0-or-later
```

### Configuration Files
```yaml
# SPDX-FileCopyrightText: 2026 Web Solutions Inc.
# SPDX-License-Identifier: AGPL-3.0-or-later
```

---

## 4. LICENSE File

Create `LICENSE` at project root with AGPL-3.0-or-later text.
The standard AGPL v3 text can be found at: https://www.gnu.org/licenses/agpl-3.0.txt

---

## 5. Third-Party Notices

Create `THIRD_PARTY_NOTICES.md` to document all dependencies and their licenses:

```markdown
# Third-Party Notices

CampusOS uses the following third-party libraries:

### MIT License
- Next.js (© Vercel Inc.)
- React (© Meta Platforms, Inc.)
- NestJS (© NestJS Contributors)
- BullMQ (© Taskforce.sh Inc.)
- ... (full list)

### Apache 2.0
- Prisma Client (© Prisma Data Inc.)
- class-variance-authority (© Joe Bell)

### ISC
- next-auth (© Balázs Orbán)
- lucide-react (© Lucide Contributors)
```

---

## 6. Actions Required

| Priority | Action | Who |
|----------|--------|-----|
| 🔴 P0 | Add `LICENSE` file (AGPL-3.0) | Legal / CTO |
| 🔴 P0 | Set `"license": "AGPL-3.0-or-later"` in all package.json files | CTO |
| 🟡 P1 | Add SPDX headers to source files | Claude Code |
| 🟡 P1 | Create THIRD_PARTY_NOTICES.md | CTO |
| 🟢 P2 | Add license badge to README | CTO |
| 🔵 P3 | Dual-license option for enterprise customers | Legal |
