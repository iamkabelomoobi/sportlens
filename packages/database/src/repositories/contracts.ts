import type { CompletedFixture, FixtureRecord, PlayerSummary, StandingRow, TeamSummary } from '@sportlens/types'
export interface TeamsRepository {
  findAll(query?: { page?: number; limit?: number; search?: string }): Promise<{ data: TeamSummary[]; total: number }>
  findBySlug(slug: string): Promise<TeamSummary | null>
  findFixtures(
    slug: string,
    query: { results?: boolean; page?: number; limit?: number },
  ): Promise<{ data: FixtureRecord[]; total: number }>
}
export interface CompetitionsRepository {
  findAll(): Promise<unknown[]>
  findBySlug(slug: string): Promise<unknown | null>
  findSeasons(slug: string): Promise<unknown[]>
}
export interface PlayersRepository {
  findAll(query?: { page?: number; limit?: number }): Promise<{ data: PlayerSummary[]; total: number }>
  findBySlug(slug: string): Promise<PlayerSummary | null>
}
export interface FixturesRepository {
  findAll(query: Record<string, unknown>): Promise<{ data: FixtureRecord[]; total: number }>
  findById(id: string): Promise<FixtureRecord | null>
  findForStandings(competitionSlug: string, seasonSlug: string): Promise<CompletedFixture[]>
}
export interface StandingsRepository {
  getStandings(competitionSlug: string, seasonSlug: string): Promise<StandingRow[]>
}
export interface StatisticsRepository {
  topScorers(query: Record<string, unknown>): Promise<unknown[]>
  topAssists(query: Record<string, unknown>): Promise<unknown[]>
  cleanSheets(query: Record<string, unknown>): Promise<unknown[]>
}
