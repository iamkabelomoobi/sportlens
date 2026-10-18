import { FixtureStatus, type StandingRow, type TeamSummary } from '@sportlens/types'
import type { FixtureForStandings, StandingsRules, TeamForStandings } from './types.js'

const defaultRules: StandingsRules = { winPoints: 3, drawPoints: 1, lossPoints: 0 }
const validScore = (value: number | null): value is number =>
  value !== null && Number.isSafeInteger(value) && value >= 0

export function calculateStandings(
  teams: TeamForStandings[],
  fixtures: FixtureForStandings[],
  competitionId: string,
  seasonId: string,
  rules: StandingsRules = defaultRules,
): StandingRow[] {
  const rows = new Map<string, StandingRow>()
  for (const team of teams)
    rows.set(team.id, {
      position: 0,
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    })
  const add = (row: StandingRow, gf: number, ga: number, result: 'W' | 'D' | 'L') => {
    row.played += 1
    row.goalsFor += gf
    row.goalsAgainst += ga
    row.goalDifference = row.goalsFor - row.goalsAgainst
    if (result === 'W') {
      row.won += 1
      row.points += rules.winPoints
    } else if (result === 'D') {
      row.drawn += 1
      row.points += rules.drawPoints
    } else {
      row.lost += 1
      row.points += rules.lossPoints
    }
    row.form = [...row.form, result].slice(-5)
  }
  for (const fixture of fixtures) {
    if (
      fixture.status !== FixtureStatus.Completed ||
      fixture.competitionId !== competitionId ||
      fixture.seasonId !== seasonId ||
      !validScore(fixture.homeScore) ||
      !validScore(fixture.awayScore)
    )
      continue
    const home = rows.get(fixture.homeTeamId)
    const away = rows.get(fixture.awayTeamId)
    if (!home || !away || fixture.homeTeamId === fixture.awayTeamId) continue
    const homeResult = fixture.homeScore > fixture.awayScore ? 'W' : fixture.homeScore < fixture.awayScore ? 'L' : 'D'
    const awayResult = homeResult === 'W' ? 'L' : homeResult === 'L' ? 'W' : 'D'
    add(home, fixture.homeScore, fixture.awayScore, homeResult)
    add(away, fixture.awayScore, fixture.homeScore, awayResult)
  }
  const ordered = [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.name.localeCompare(b.team.name) ||
      a.team.id.localeCompare(b.team.id) ||
      (rules.tieBreaker?.(a, b) ?? 0),
  )
  ordered.forEach((row, index) => {
    row.position = index + 1
  })
  return ordered
}
