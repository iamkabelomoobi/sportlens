import { describe, expect, it } from 'vitest'
import { FixtureStatus } from '@sportlens/types'
import { calculateStandings } from './calculate-standings.js'
import type { FixtureForStandings, TeamForStandings } from './types.js'

const teams: TeamForStandings[] = [
  { id: 'a', name: 'Alpha', slug: 'alpha' },
  { id: 'b', name: 'Bravo', slug: 'bravo' },
  { id: 'c', name: 'Charlie', slug: 'charlie' },
]
const fixture = (
  id: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number | null,
  awayScore: number | null,
  status = FixtureStatus.Completed,
): FixtureForStandings => ({
  id,
  competitionId: 'comp',
  seasonId: 'season',
  homeTeamId,
  awayTeamId,
  homeScore,
  awayScore,
  status,
})

describe('calculateStandings', () => {
  it('calculates wins, draws, losses, goals, points and recent form', () => {
    const rows = calculateStandings(
      teams,
      [fixture('1', 'a', 'b', 2, 0), fixture('2', 'b', 'c', 1, 1), fixture('3', 'c', 'a', 3, 0)],
      'comp',
      'season',
    )
    expect(
      rows.map(({ team, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points, form }) => ({
        team: team.id,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        form,
      })),
    ).toEqual([
      {
        team: 'c',
        played: 2,
        won: 1,
        drawn: 1,
        lost: 0,
        goalsFor: 4,
        goalsAgainst: 1,
        goalDifference: 3,
        points: 4,
        form: ['D', 'W'],
      },
      {
        team: 'a',
        played: 2,
        won: 1,
        drawn: 0,
        lost: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        goalDifference: -1,
        points: 3,
        form: ['W', 'L'],
      },
      {
        team: 'b',
        played: 2,
        won: 0,
        drawn: 1,
        lost: 1,
        goalsFor: 1,
        goalsAgainst: 3,
        goalDifference: -2,
        points: 1,
        form: ['L', 'D'],
      },
    ])
  })
  it('ignores ineligible fixtures and counts a completed zero-zero draw', () => {
    const rows = calculateStandings(
      teams,
      [
        fixture('0', 'a', 'b', 0, 0),
        fixture('x', 'a', 'c', 9, 0, FixtureStatus.Postponed),
        fixture('y', 'a', 'c', 9, 0, FixtureStatus.Cancelled),
        fixture('z', 'a', 'c', null, null),
      ],
      'comp',
      'season',
    )
    expect(rows[0]).toMatchObject({ team: { id: 'a' }, played: 1, drawn: 1, points: 1 })
    expect(rows.find((row) => row.team.id === 'c')).toMatchObject({ played: 0, points: 0 })
  })
  it('uses deterministic tie breakers and caps form at five results', () => {
    const fixtures = Array.from({ length: 6 }, (_, index) => fixture(String(index), 'a', 'b', 1, 0))
    const rows = calculateStandings(teams, fixtures, 'comp', 'season')
    expect(rows[0]).toMatchObject({ team: { id: 'a' }, played: 6, points: 18, form: ['W', 'W', 'W', 'W', 'W'] })
    expect(rows[1]).toMatchObject({ team: { id: 'c' }, played: 0, points: 0 })
    expect(rows[2]).toMatchObject({ team: { id: 'b' }, played: 6, points: 0 })
  })
})
