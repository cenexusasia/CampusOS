# CampusOS — Testing Strategy

## Philosophy
- Tests are **non-negotiable** — every feature must have tests
- Follow the **Testing Trophy** (not pyramid):
  ```
    ╱  Static Analysis (TypeScript) ╲
   ╱   Integration Tests (NestJS)    ╲
  ╱    Unit Tests (Services)          ╲
 ╱     E2E Tests (Playwright)          ╲
╱──────────────────────────────────────╲
  ```

## Current State
| Test Type | Status | Coverage |
|-----------|--------|----------|
| TypeScript strict mode | ⚠️ Some errors | Pre-existing decorator issues |
| Lint (ESLint) | ⚠️ Passing | Basic config |
| Unit tests | ❌ Not started | 0 tests |
| Integration tests | ❌ Not started | 0 tests |
| E2E tests | ❌ Not started | 0 tests |
| Playwright | ❌ Not started | 0 tests |

## Immediate Gaps (Sprint 1)

### 1. TypeScript Cleanup
- Current: 5 pre-existing TS errors (NestJS decorator compatibility with TS 5.7)
- Fix: Downgrade TypeScript to 5.5.x or add `skipLibCheck: true`
- Priority: **High** — blocks clean builds

### 2. ESLint
- Root `eslint.config.js` exists but no actual rules enabled
- Action: Add `@typescript-eslint` rules

### 3. Vitest Setup
- API package lists `vitest` in devDependencies
- No test files exist
- Action: Add basic service unit tests

## Testing Plan

### Unit Tests (Vitest)
| Module | Priority | Tests Needed |
|--------|----------|-------------|
| AuthService | P1 | Login, register, refresh, invalid credentials |
| AIService | P1 | Chat completion, error handling |
| TenantsService | P1 | CRUD, membership management |
| CoursesService | P2 | CRUD, enrollment |
| Connectors (Moodle) | P2 | Sync, validation |
| PrismaService | P3 | Connection, error handling |

### Integration Tests (Supertest)
| Module | Priority | Tests Needed |
|--------|----------|-------------|
| Auth endpoints | P1 | Login flow, token refresh, auth guard |
| Health endpoint | P1 | Returns 200, includes version |
| Tenant endpoints | P2 | CRUD with JWT, unauthorized access |
| AI chat endpoint | P2 | Chat with valid/invalid tokens |

### E2E Tests (Playwright)
| Page | Priority | Tests Needed |
|------|----------|-------------|
| Login | P1 | Happy path, invalid credentials, redirect |
| Dashboard | P1 | Loads with authenticated user |
| AI Chat | P1 | Send message, receive response |
| Students | P2 | List, search |
| Settings | P2 | Profile update |

## Test Infrastructure

### Commands
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:e2e          # E2E tests
pnpm lint              # ESLint
pnpm typecheck         # TypeScript
pnpm build             # Ensure build passes

# API-specific
cd apps/api && npx vitest run
npx playwright test    # From web directory
```

### CI Integration (GitHub Actions)
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

## Quality Gates (Definition of Done)
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] New code has ≥80% test coverage
- [ ] Playwright tests pass (if UI changes)
