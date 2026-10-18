# SportLens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone SportLens monorepo with Payload CMS administration, a fixture-derived football standings engine, a NestJS public API, PostgreSQL/Redis infrastructure, neutral seed data, and meaningful automated tests.

**Architecture:** Payload owns administrative data entry in `apps/cms`; NestJS exposes consumer-focused DTOs from repository interfaces in `apps/api`. Shared types and the pure standings domain live in packages so the API and CMS do not duplicate football rules.

**Tech Stack:** TypeScript, Turborepo, npm workspaces, Payload 3, Next.js, NestJS, PostgreSQL, Redis, Vitest, Swagger/OpenAPI, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-10-16-sportlens-design.md`

## Global Constraints

- Do not modify `/home/kabelo-moobi/Workspace/bbs/mntezama-united-fc/apps/cms`.
- Use neutral fictional seed data and SportLens branding only.
- Standings derive only from eligible completed fixtures; manual table rows are not the source of truth.
- API controllers must not call Payload directly; use services, repository interfaces, and response mappers.
- Store only hashed API keys; raw keys are returned only at creation time.
- Preserve strong TypeScript typing and avoid premature microservices.
- Use `apply_patch` for authored file changes and do not commit unless explicitly requested.

## Review Focus

- A completed fixture with a zero score must count, while missing or negative scores must not.
- A postponed, cancelled, live, halftime, or abandoned fixture must not change standings.
- Teams tied on points must sort deterministically through goal difference, goals scored, name, and identifier.
- API repository failures and cache failures must become safe API responses or repository fallbacks, never leaked infrastructure errors.
- API keys must never be persisted or logged in raw form, and inactive keys must be rejected.

### Task 1: Scaffold workspace and shared packages

**Files:**

- Create: `package.json`, `turbo.json`, `.gitignore`, `.env.example`, `docker-compose.yml`, `README.md`
- Create: `apps/cms/package.json`, `apps/cms/tsconfig.json`, `apps/cms/src/payload.config.ts`
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
- Create: `packages/types/package.json`, `packages/types/src/index.ts`
- Create: `packages/domain/package.json`, `packages/domain/src/index.ts`
- Create: `packages/database/package.json`, `packages/database/src/index.ts`
- Create: `packages/config/package.json`, `packages/config/src/index.ts`

**Interfaces:**

- Produces npm workspace package names `@sportlens/types`, `@sportlens/domain`, `@sportlens/database`, and `@sportlens/config`.
- Produces local PostgreSQL and Redis service names `sportlens-postgres` and `sportlens-redis`.

- [ ] **Step 1: Create the workspace manifests and TypeScript base configuration.** Set Node to `>=22`, use npm workspaces, and add scripts `dev`, `build`, `lint`, `test`, `typecheck`, and `seed`.
- [ ] **Step 2: Add Docker Compose and environment schema.** Configure PostgreSQL 16 with database `sportlens`, Redis 7, ports `5433` and `6380`, and variables `DATABASE_URL`, `REDIS_URL`, `PAYLOAD_SECRET`, `CMS_PORT`, `API_PORT`, and `CORS_ORIGINS`.
- [ ] **Step 3: Add minimal app bootstraps.** Make the Nest app compile and make the CMS config load a PostgreSQL adapter with local defaults.
- [ ] **Step 4: Run `npm install` and `npm run typecheck`.** Expected: workspace dependency resolution succeeds and all placeholder apps/packages typecheck.

### Task 2: Define shared football contracts

**Files:**

- Modify: `packages/types/src/index.ts`
- Create: `packages/types/src/football.ts`
- Create: `packages/types/src/api.ts`
- Test: `packages/types/src/football.spec.ts`

**Interfaces:**

- Produces enums `CompetitionType`, `FixtureStatus`, `MatchEventType`, `PlayerPosition`, and `ApiPlan`.
- Produces interfaces `TeamSummary`, `PlayerSummary`, `FixtureRecord`, `StandingRow`, `CompletedFixture`, `Pagination`, and `ApiErrorBody`.

- [ ] **Step 1: Write enum and contract tests.** Assert the public string values exactly match the design and that a `StandingRow` includes P/W/D/L/GF/GA/GD/PTS/form.
- [ ] **Step 2: Run `npx vitest run packages/types/src/football.spec.ts`.** Expected: FAIL because the contracts do not exist.
- [ ] **Step 3: Implement the contracts and package exports.** Keep database IDs as strings and use explicit nullable fields where API consumers need stable shapes.
- [ ] **Step 4: Run the focused test and `npm run typecheck`.** Expected: PASS.

### Task 3: Implement and test the standings engine

**Files:**

- Create: `packages/domain/src/standings/types.ts`
- Create: `packages/domain/src/standings/calculate-standings.ts`
- Create: `packages/domain/src/index.ts`
- Test: `packages/domain/src/standings/calculate-standings.spec.ts`

**Interfaces:**

- Consumes `FixtureForStandings`, `TeamForStandings`, and `StandingsRules`.
- Produces `calculateStandings(input): StandingRow[]`.

- [ ] **Step 1: Write failing unit tests for wins, draws, losses, points, GF, GA, GD, and form.** Include a two-team fixture set with expected exact rows.
- [ ] **Step 2: Add tests for deterministic sorting and tied points.** Assert priority points, goal difference, goals scored, name, and ID.
- [ ] **Step 3: Add tests for ignored postponed, cancelled, scheduled, live, halftime, abandoned, cross-season, cross-competition, and invalid-score fixtures.** Assert zero-score completed matches still count.
- [ ] **Step 4: Run the focused Vitest file.** Expected: FAIL with missing `calculateStandings`.
- [ ] **Step 5: Implement the pure calculation function.** Initialize every supplied team, filter eligible fixtures, update both sides, append and cap form at five, and sort without mutating input arrays.
- [ ] **Step 6: Run the focused tests and package typecheck.** Expected: PASS.

### Task 4: Build Payload CMS collections and access control

**Files:**

- Create: `apps/cms/src/collections/Users.ts`, `Media.ts`, `Competitions.ts`, `Seasons.ts`, `Teams.ts`, `Players.ts`, `Venues.ts`, `Fixtures.ts`, `MatchEvents.ts`, `PlayerMatchStatistics.ts`, `TeamMatchStatistics.ts`, `ApiConsumers.ts`
- Create: `apps/cms/src/access/index.ts`
- Create: `apps/cms/src/hooks/fixtureSlug.ts`, `apps/cms/src/hooks/invalidateSportCache.ts`
- Modify: `apps/cms/src/payload.config.ts`
- Test: `apps/cms/src/collections/collections.spec.ts`

**Interfaces:**

- Produces Payload slugs `competitions`, `seasons`, `teams`, `players`, `venues`, `fixtures`, `match-events`, `player-match-statistics`, `team-match-statistics`, and `api-consumers`.
- Produces normalized enum values shared from `@sportlens/types`.

- [ ] **Step 1: Write configuration tests that inspect collection slugs, required fields, fixture statuses, event types, and admin write access.**
- [ ] **Step 2: Run the focused test.** Expected: FAIL because the CMS collections do not exist.
- [ ] **Step 3: Implement small collection config files.** Add relationships, indexes, neutral labels, upload relations, and editor/admin access. Keep players separate from future season registrations.
- [ ] **Step 4: Implement stable fixture slug generation.** Preserve an existing slug on update; otherwise derive it from team slugs and kickoff date and resolve collisions.
- [ ] **Step 5: Register collections and configure Payload PostgreSQL/UUID support.** Do not import or reuse Mntezama components or branding.
- [ ] **Step 6: Run the focused tests and `npm run --workspace @sportlens/cms typecheck`.** Expected: PASS.

### Task 5: Add neutral seed data and CMS verification

**Files:**

- Create: `apps/cms/src/seed/data.ts`
- Create: `apps/cms/src/seed.ts`
- Modify: `apps/cms/package.json`
- Test: `apps/cms/src/seed/data.spec.ts`

**Interfaces:**

- Produces `seedSportLens(payload)` and deterministic seed builders for teams, players, fixtures, events, and statistics.

- [ ] **Step 1: Write seed-builder tests.** Assert one competition, one season, four teams, several players, completed and upcoming fixtures, events, and no Mntezama names or slugs.
- [ ] **Step 2: Run the focused test.** Expected: FAIL because seed builders do not exist.
- [ ] **Step 3: Implement fictional seed data.** Use neutral names such as Riverstone City, Northstar Athletic, Valley Rovers, and Coastal United; create completed results whose standings are calculable.
- [ ] **Step 4: Implement idempotent Payload seeding.** Look up by slug before create, never delete existing data, and connect relationships by IDs.
- [ ] **Step 5: Run seed-builder tests and CMS typecheck.** Expected: PASS.

### Task 6: Implement database repositories and API domain services

**Files:**

- Modify: `packages/database/src/index.ts`
- Create: `packages/database/src/repositories/contracts.ts`
- Create: `packages/database/src/repositories/postgres-repositories.ts`
- Create: `apps/api/src/common/errors.ts`, `pagination.ts`, `mappers.ts`
- Create: `apps/api/src/modules/competitions/*`, `teams/*`, `players/*`, `fixtures/*`, `standings/*`, `statistics/*`
- Test: `apps/api/src/modules/standings/standings.service.spec.ts`, `apps/api/src/modules/teams/teams.service.spec.ts`

**Interfaces:**

- Produces `CompetitionsRepository`, `TeamsRepository`, `PlayersRepository`, `FixturesRepository`, `StandingsRepository`, and `StatisticsRepository`.
- Produces service methods for list/detail/fixture/stats operations and maps missing records to stable error codes.

- [ ] **Step 1: Write service tests with in-memory repository doubles.** Cover team lookup, pagination, team fixtures/results filtering, and standings mapping.
- [ ] **Step 2: Run focused API tests.** Expected: FAIL because repository contracts and services do not exist.
- [ ] **Step 3: Implement repository interfaces and a PostgreSQL adapter.** Keep SQL/query details inside repositories and return domain records only.
- [ ] **Step 4: Implement services and response mappers.** Return consumer-focused objects, consistent pagination, and `TEAM_NOT_FOUND`, `PLAYER_NOT_FOUND`, `FIXTURE_NOT_FOUND`, and `COMPETITION_NOT_FOUND` errors.
- [ ] **Step 5: Run focused tests and API typecheck.** Expected: PASS.

### Task 7: Add NestJS controllers, validation, Swagger, and errors

**Files:**

- Modify: `apps/api/src/app.module.ts`, `apps/api/src/main.ts`
- Create: `apps/api/src/common/dto/pagination.dto.ts`, `query.dto.ts`, `errors.filter.ts`
- Create: controllers for competitions, seasons/standings, teams, players, fixtures, and statistics
- Create: DTOs and Swagger response schemas for every initial endpoint
- Test: `apps/api/src/common/errors.filter.spec.ts`, `apps/api/src/modules/teams/teams.controller.spec.ts`

**Interfaces:**

- Produces routes under `/api/v1` matching the approved endpoint list.
- Produces Swagger at `/api/docs` with `X-API-Key` security scheme.

- [ ] **Step 1: Write controller tests for validation, pagination, and safe not-found responses.**
- [ ] **Step 2: Run focused tests.** Expected: FAIL because controllers and filters do not exist.
- [ ] **Step 3: Implement DTO validation with `class-validator` and global transformation.** Clamp page/limit, validate ISO dates, and reject invalid enum values.
- [ ] **Step 4: Implement controllers using services only.** Add Swagger tags, query parameters, response DTOs, pagination examples, and no Payload document metadata.
- [ ] **Step 5: Implement the consistent error filter.** Map domain errors to JSON `{ statusCode, code, message }` without stack traces or database errors.
- [ ] **Step 6: Run focused tests and API typecheck.** Expected: PASS.

### Task 8: Add Redis caching, API keys, and rate limiting

**Files:**

- Create: `apps/api/src/common/cache/cache.service.ts`, `cache.keys.ts`
- Create: `apps/api/src/common/auth/api-key.service.ts`, `api-key.guard.ts`, `public-route.decorator.ts`
- Create: `apps/api/src/common/rate-limit/rate-limit.guard.ts`, `plans.ts`
- Modify: `apps/api/src/app.module.ts` and relevant services
- Test: `apps/api/src/common/auth/api-key.service.spec.ts`, `api-key.guard.spec.ts`, `rate-limit.guard.spec.ts`, `cache.service.spec.ts`

**Interfaces:**

- Produces `CacheService.get/set/deleteByPrefix`, `ApiKeyService.hash/verify`, and plan-based request limits.

- [ ] **Step 1: Write tests for one-way API-key hashing and inactive/missing key rejection.** Assert raw keys are absent from stored consumer records and logs.
- [ ] **Step 2: Write tests for plan limits and cache fallback/invalidation.** Assert cache misses call repositories and mutation invalidation removes affected standings keys.
- [ ] **Step 3: Run focused tests.** Expected: FAIL because auth, rate-limit, and cache services do not exist.
- [ ] **Step 4: Implement Redis-backed cache service with in-memory fallback for tests.** Use explicit namespaced keys and safe TTLs; never cache live-changing reads aggressively.
- [ ] **Step 5: Implement API-key guard and public-route decorator.** Allow selected read routes without a key, require `X-API-Key` elsewhere, update `lastUsedAt` asynchronously, and reject inactive consumers.
- [ ] **Step 6: Implement rate limiting by `free`, `developer`, `business`, and `enterprise` plans.** Return a safe 429 error and expose rate headers.
- [ ] **Step 7: Run focused tests and API typecheck.** Expected: PASS.

### Task 9: Wire integration, Docker seed flow, and documentation

**Files:**

- Modify: `docker-compose.yml`, root `package.json`, app package scripts
- Create: `apps/api/.env.example`, `apps/cms/.env.example`
- Modify: `README.md`
- Create: `docs/api-example.md`

- [ ] **Step 1: Add a local API-to-PostgreSQL repository wiring module.** Configure connection pooling and graceful shutdown.
- [ ] **Step 2: Add Docker healthchecks and documented startup order.** Ensure API/CMS development commands can run after PostgreSQL and Redis are healthy.
- [ ] **Step 3: Document installation, environment setup, Docker, migrations, seed commands, CMS access, API docs, architecture diagram, and project structure.**
- [ ] **Step 4: Run `npm run build`, `npm run lint`, and `npm run test`.** Expected: all configured checks pass.

### Task 10: Final verification and cleanup

**Files:**

- Modify only files required by failing verification checks.

- [ ] **Step 1: Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from the repository root.** Capture output and inspect every failure.
- [ ] **Step 2: Run the standings suite independently and verify all review-focus cases.** Expected: all domain tests pass.
- [ ] **Step 3: Start PostgreSQL and Redis with `docker compose up -d`, run the seed command, and query the API health/Swagger routes.** Expected: services become healthy, seed is idempotent, and `/api/docs` responds.
- [ ] **Step 4: Check the reference CMS worktree is unchanged with `git -C /home/kabelo-moobi/Workspace/bbs/mntezama-united-fc status --short`.** Expected: no changes caused by SportLens.
- [ ] **Step 5: Confirm no raw secrets, Mntezama branding, hardcoded club IDs, or generated build artifacts are tracked.**
