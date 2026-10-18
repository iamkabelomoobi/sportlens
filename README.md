# SportLens

Football data, fixtures, standings and statistics through one platform.

SportLens is a standalone football-data platform designed for multiple competitions, seasons, clubs, players, websites, mobile applications, sports media products, and third-party developers.

## Architecture

```text
                 ┌────────────────────┐
                 │  Payload CMS       │
                 │  apps/cms           │
                 └─────────┬──────────┘
                           │ PostgreSQL
┌──────────────┐   ┌───────▼──────────┐   ┌──────────────┐
│ API consumers├──►│ NestJS API       │◄──┤ Redis cache  │
└──────────────┘   │ apps/api         │   └──────────────┘
                   └───────┬──────────┘
                           │
                   ┌───────▼──────────┐
                   │ Shared domain     │
                   │ types + standings │
                   └──────────────────┘
```

`apps/cms` hosts the developer login/dashboard shell and manages sports data. Better Auth in `apps/api` owns human identity, sessions, OAuth, organizations, invitations, email verification, password reset, and optional TOTP 2FA. SportLens owns application/API-key lifecycle and authorization policy. `packages/domain` contains the pure fixture-derived standings engine, while `packages/types` contains shared contracts.

## Technology

- TypeScript and Turborepo with npm workspaces
- Payload CMS 3 and Next.js
- NestJS REST API with Swagger/OpenAPI
- PostgreSQL 16 and Redis 7
- Vitest for domain, seed, and API service tests

## Installation

Requirements: Node.js 22+, npm 11+, and Docker Desktop or Docker Engine.

```bash
npm install
cp .env.example .env
docker compose --profile dev up -d
```

The application uses Supabase Postgres and Upstash Redis from `DATABASE_URL` and `REDIS_URL`. The `dev` profile starts only local MailHog and MinIO support services; fill in the hosted service values before starting the API or CMS.

For a fully local database fallback, use the separate `local` profile and local connection values:

```bash
docker compose --profile local up -d
```

Local Postgres listens on `localhost:5433` and Redis on `localhost:6380`.

MailHog is available at `http://localhost:8025` and accepts SMTP on port `1025`. MinIO is available at `http://localhost:9001` and exposes its S3-compatible API on port `9000`; the initialization service creates the `sportlens` bucket. The root `Dockerfile` can run either app for development with `--build-arg APP=api` or `--build-arg APP=cms`.

## Email and storage providers

Development uses MailHog and MinIO. Production should set `MAIL_PROVIDER=resend` with `RESEND_API_KEY` and `EMAIL_FROM`. Production uses Supabase Postgres through the single `DATABASE_URL` connection string, plus Supabase Storage through its S3-compatible API: set `STORAGE_PROVIDER=supabase` with `SUPABASE_S3_ENDPOINT`, `SUPABASE_S3_BUCKET`, `SUPABASE_S3_REGION`, `SUPABASE_S3_ACCESS_KEY_ID`, and `SUPABASE_S3_SECRET_ACCESS_KEY`. The S3 endpoint should use Supabase's `/storage/v1/s3` endpoint. Provider secrets belong in the deployment environment, not in the repository.

## Running locally

```bash
npm run dev
```

The API runs on `http://localhost:3001`, with Swagger at `http://localhost:3001/api/docs`. Payload CMS runs on `http://localhost:3000/admin`.

The developer dashboard login is at `http://localhost:3000/login`. Email/password accounts must verify their email before creating organizations, applications, or API keys. Google and GitHub accounts are treated as verified only when the provider reports a verified email.

To run one application:

```bash
npm run dev --workspace @sportlens/api
npm run dev --workspace @sportlens/cms
```

## Data and migrations

Payload uses its PostgreSQL adapter. In local development, `PAYLOAD_SCHEMA_PUSH=true` lets Payload synchronize the schema. For controlled environments, disable schema push and use Payload migrations after generating them:

```bash
npm run generate:types --workspace @sportlens/cms
npx payload migrate --dir apps/cms
```

Seed neutral fictional demo data with:

```bash
npm run seed
```

The seed is idempotent and creates one competition, one season, four teams, players, completed and scheduled fixtures, and relationships needed to calculate standings.

## API

All consumer routes are under `/api/v1`:

- `GET /competitions`
- `GET /competitions/:slug`
- `GET /competitions/:slug/seasons`
- `GET /competitions/:competitionSlug/seasons/:seasonSlug/standings`
- `GET /teams`, `GET /teams/:slug`, and team fixtures/results/stats
- `GET /players`, `GET /players/:slug`, and player stats
- `GET /fixtures`, `GET /fixtures/:id`
- `GET /stats/top-scorers`, `/stats/top-assists`, and `/stats/clean-sheets`

The API returns consumer-focused JSON with `data` and pagination fields. Sport-data routes require `X-API-Key`; dashboard management uses an HTTP-only Better Auth session and never accepts API keys as login credentials. Raw keys use `sportlens_test_...` or `sportlens_live_...`, are returned only at creation/rotation, and are stored as SHA-256 hashes.

### Organizations, applications, and keys

Create an organization from the authenticated dashboard, then create applications under that organization. API keys are always attached to an application and inherit its organization boundary:

```bash
curl https://api.example.com/api/v1/teams/mamelodi-sundowns/stats \
  -H "X-API-Key: sportlens_live_xxxxxxxxxxxxxxxxx"
```

Dashboard key management uses the session-protected routes:

```bash
curl -X POST http://localhost:3001/api/v1/dashboard/api-keys \
  -H "Cookie: better-auth.session_token=..." \
  -H 'Content-Type: application/json' \
  -d '{"organizationId":"org_...","applicationId":"app_...","name":"Production","environment":"production"}'
```

Organization roles are `owner`, `admin`, `developer`, and `viewer`; authorization decisions are centralized in `apps/api/src/auth/access-control.ts`. Plan limits are configurable with `SPORTLENS_RATE_*` variables. TOTP 2FA is optional for developers and available through Better Auth security routes; it is the boundary for future sensitive-action enforcement.

## Standings

Standings are derived from completed fixtures. Postponed, cancelled, scheduled, live, halftime, abandoned, cross-competition, cross-season, and invalid-score fixtures are ignored. Default scoring is three points for a win and one for a draw. Sorting is points, goal difference, goals scored, team name, then team ID. Recent form keeps the latest five results.

## Checks

```bash
npm run format
npm run typecheck
npm run lint
npm run test
npm run build
```

Use `npm run format:check` in CI to verify formatting without changing files.

## Project structure

```text
apps/api        NestJS public API
apps/cms        Payload administration
packages/types  Shared domain and API contracts
packages/domain Fixture-derived standings engine
packages/database Repository interfaces and database boundary
packages/config Shared environment configuration
docker-compose.yml PostgreSQL and Redis development services
```

The existing Mntezama United FC CMS was inspected as a domain reference only. It is not imported, modified, or used as a runtime dependency.
