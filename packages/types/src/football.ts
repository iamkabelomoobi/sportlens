export enum CompetitionType {
  League = 'league',
  Cup = 'cup',
  Tournament = 'tournament',
  Friendly = 'friendly',
}
export enum CompetitionStatus {
  Active = 'active',
  Inactive = 'inactive',
}
export enum SeasonStatus {
  Upcoming = 'upcoming',
  Active = 'active',
  Completed = 'completed',
}
export enum FixtureStatus {
  Scheduled = 'scheduled',
  Postponed = 'postponed',
  Cancelled = 'cancelled',
  Live = 'live',
  Halftime = 'halftime',
  Completed = 'completed',
  Abandoned = 'abandoned',
}
export enum MatchEventType {
  Goal = 'goal',
  OwnGoal = 'own_goal',
  PenaltyGoal = 'penalty_goal',
  PenaltyMissed = 'penalty_missed',
  YellowCard = 'yellow_card',
  RedCard = 'red_card',
  SecondYellow = 'second_yellow',
  Substitution = 'substitution',
}
export enum PlayerPosition {
  Goalkeeper = 'goalkeeper',
  Defender = 'defender',
  Midfielder = 'midfielder',
  Forward = 'forward',
}
export enum ApiPlan {
  Free = 'free',
  Developer = 'developer',
  Business = 'business',
  Enterprise = 'enterprise',
}
export type FormResult = 'W' | 'D' | 'L'
export interface TeamSummary {
  id: string
  name: string
  slug: string
  shortName?: string | null
  logoUrl?: string | null
}
export interface PlayerSummary {
  id: string
  displayName: string
  slug: string
  position?: PlayerPosition | null
  team?: TeamSummary | null
}
export interface FixtureRecord {
  id: string
  slug: string
  competition: { slug: string; name: string }
  season: { slug: string; name: string }
  homeTeam: TeamSummary
  awayTeam: TeamSummary
  kickoffAt: string
  status: FixtureStatus
  homeScore: number | null
  awayScore: number | null
  venue?: string | null
}
export interface CompletedFixture {
  id: string
  competitionId: string
  seasonId: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number | null
  awayScore: number | null
  status: FixtureStatus
}
export interface StandingRow {
  position: number
  team: TeamSummary
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: FormResult[]
}
