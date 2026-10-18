# SportLens Design Specification

**Date:** 2026-10-16

**Status:** Approved in conversation; awaiting written-spec review

## Goal

SportLens is a standalone football data platform for managing multiple competitions, seasons, teams, players, fixtures, match events, statistics, and derived standings. It provides an administrator-facing Payload CMS and a stable consumer-facing NestJS REST API.

The Mntezama United FC CMS is a reference only. SportLens does not modify it, copy its branding, or retain club-specific assumptions.

## Reference Findings

The reference CMS currently models teams, team members, competitions, fixtures, and manually persisted league tables. Its reusable concepts are relationship-based football entities, editor/public access separation, stable fixture slugs, deterministic seed scheduling, and derived table fields such as played, goal difference, and points.

Its league-table implementation validates normalized competition/season identity, rejects duplicate teams, derives totals from wins/draws/losses and goals, and sorts seed rows by points, goal difference, goals scored, team name, and identifier. SportLens generalizes those ideas into a fixture-derived standings domain service.

## Architecture

The project is a Turborepo monorepo:

```text
apps/cms       Payload 3 administration application
apps/api       NestJS public REST API
packages/types Shared enums and public domain contracts
packages/domain Standings engine and football domain rules
packages/database Database/repository contracts and PostgreSQL implementation
packages/config Environment validation and shared configuration
```

Payload CMS and NestJS initially share PostgreSQL, but the API does not call Payload APIs. API services depend on repository interfaces, and repository implementations own database access. This preserves a clean boundary for future read models or database adapters without premature microservices.

Development infrastructure is PostgreSQL and Redis through Docker Compose.

## Domain Model

Payload collections include:

- `competitions`: name, slug, short name, type, logo, country, description, status.
- `seasons`: name, slug, competition, start date, end date, status.
- `teams`: neutral club identity, location, stadium, colours, website, logo, and status; no competition ownership.
- `players`: identity, profile, nationality, position, shirt number, current team relationship, and status. The model leaves room for future season-registration records.
- `venues`: address and geospatial/capacity information.
- `fixtures`: competition, season, home/away teams, venue, kickoff, round, match week, lifecycle status, scores, attendance, and referee.
- `match-events`: normalized fixture events with team, player, related player, minute, added time, type, and metadata.
- `player-match-statistics`: fixture/player rows for practical performance metrics.
- `team-match-statistics`: fixture/team rows for possession and match metrics.
- `api-consumers`: hashed API keys, application metadata, status, plan/rate limit, creation time, and last use.

Media is an upload collection used by logos and photos. Users are restricted to authenticated administrators/editor roles for CMS mutations; public reads are limited to active/published sports data.

Fixture statuses are `scheduled`, `postponed`, `cancelled`, `live`, `halftime`, `completed`, and `abandoned`. Match event types are `goal`, `own_goal`, `penalty_goal`, `penalty_missed`, `yellow_card`, `red_card`, `second_yellow`, and `substitution`.

## Standings Engine

`packages/domain` exposes a pure calculation function/service that accepts a competition-season fixture set and team set. Only fixtures with status `completed`, valid non-negative integer scores, and matching competition and season are eligible. Postponed, cancelled, scheduled, live, halftime, and abandoned fixtures are ignored.

Each participating team receives P, W, D, L, GF, GA, GD, PTS, and a recent form list capped at five results, oldest to newest. Default scoring is win = 3, draw = 1, loss = 0. The rules are injected/configurable so competition-specific scoring and future head-to-head tie breakers can be added without changing controllers.

Default deterministic ordering is points descending, goal difference descending, goals scored descending, team name ascending, and team identifier ascending. The result contains no database or Payload types.

## Public API

NestJS mounts all consumer routes under `/api/v1` and provides Swagger at `/api/docs`. Controllers use DTOs, services, repository interfaces, and response mappers. Payload document metadata is never exposed directly.

Initial resources are competitions, seasons, standings, teams, team fixtures/results/stats, players, player stats, fixtures, top scorers, top assists, and clean sheets. List endpoints support competition, season, team, status, date range, page, and limit where relevant.

Responses use stable envelopes:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 25, "total": 0, "totalPages": 0 }
}
```

Errors use a consistent shape with `statusCode`, machine-readable `code`, and safe `message`. Not-found cases map to domain-specific codes such as `TEAM_NOT_FOUND`.

Selected metadata and read routes may be public. Protected routes accept `X-API-Key`; the guard hashes the supplied key and compares it to stored hashes. Raw keys are shown only at creation time. Rate limits are configured by plan (`free`, `developer`, `business`, `enterprise`) and enforced through a NestJS guard/interceptor boundary without billing.

## Caching and Invalidation

Redis caches standings, competition metadata, team statistics, top-player statistics, and historical fixture queries with explicit keys containing competition and season where applicable. Live, scheduled, and recently changing fixture data is either uncached or given short TTLs.

Fixture, event, and statistics mutations invalidate affected competition-season standings, team statistics, player statistics, and ranking keys. Cache failures do not make read requests fail; the API falls back to repositories.

## Seed and Development Data

The seed creates one fictional league, one season, four or more fictional teams, venues, players, completed fixtures, upcoming fixtures, events, and match statistics. Standings are calculated from completed fixtures at read time. No Mntezama production data, branding, IDs, or hardcoded team assumptions are used.

Docker Compose starts PostgreSQL and Redis. `.env.example` documents local connection strings, Payload secret, API port, CMS port, and CORS origins. Root scripts expose development, build, lint, test, and seed workflows.

## Testing

The domain test suite covers wins, draws, losses, points, goals for/against, goal difference, deterministic sorting, form truncation, tied points, and ignored non-completed fixtures. API tests cover repository-backed service mapping, not-found errors, API-key hashing/guard behavior, rate-limit behavior, pagination, and cache fallback/invalidation. CMS configuration is typechecked and build-tested.

## Non-Goals

The initial release does not include billing, subscriptions, live data ingestion, a public frontend, advanced analytics, transfer history, season-registration UI, head-to-head tie breakers, or microservice deployment. Interfaces should leave room for those capabilities without implementing them prematurely.
