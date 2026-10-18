import type { FixtureStatus, FormResult, TeamSummary, StandingRow } from '@sportlens/types'
export interface FixtureForStandings {
  id: string
  competitionId: string
  seasonId: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number | null
  awayScore: number | null
  status: FixtureStatus
}
export interface TeamForStandings extends TeamSummary {}
export interface StandingsRules {
  winPoints: number
  drawPoints: number
  lossPoints: number
  tieBreaker?: (a: StandingRow, b: StandingRow) => number
}
export type { FormResult }
