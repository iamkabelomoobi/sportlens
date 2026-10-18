import { Injectable } from '@nestjs/common'
import { calculateStandings } from '@sportlens/domain'
import { FixtureStatus, type FixtureRecord, type PlayerSummary, type TeamSummary } from '@sportlens/types'
import { notFound } from '../common/errors.js'
import { pageParams, pagination } from '../common/pagination.js'
import { CacheService } from '../common/cache/cache.service.js'

const teams: TeamSummary[] = [
  { id: 'riverstone-city', name: 'Riverstone City', slug: 'riverstone-city', shortName: 'Riverstone' },
  { id: 'northstar-athletic', name: 'Northstar Athletic', slug: 'northstar-athletic', shortName: 'Northstar' },
  { id: 'valley-rovers', name: 'Valley Rovers', slug: 'valley-rovers', shortName: 'Valley' },
  { id: 'coastal-united', name: 'Coastal United', slug: 'coastal-united', shortName: 'Coastal' },
]
const fixtures: FixtureRecord[] = [
  {
    id: 'fixture-1',
    slug: 'riverstone-city-vs-northstar-athletic-2026-09-01',
    competition: { slug: 'continental-demo-league', name: 'Continental Demo League' },
    season: { slug: '2026-27', name: '2026/27' },
    homeTeam: teams[0],
    awayTeam: teams[1],
    kickoffAt: '2026-09-01T15:00:00Z',
    status: FixtureStatus.Completed,
    homeScore: 2,
    awayScore: 0,
    venue: 'Riverstone Ground',
  },
  {
    id: 'fixture-2',
    slug: 'valley-rovers-vs-coastal-united-2026-09-02',
    competition: { slug: 'continental-demo-league', name: 'Continental Demo League' },
    season: { slug: '2026-27', name: '2026/27' },
    homeTeam: teams[2],
    awayTeam: teams[3],
    kickoffAt: '2026-09-02T15:00:00Z',
    status: FixtureStatus.Completed,
    homeScore: 1,
    awayScore: 1,
    venue: 'Valley Park',
  },
  {
    id: 'fixture-3',
    slug: 'coastal-united-vs-riverstone-city-2026-09-09',
    competition: { slug: 'continental-demo-league', name: 'Continental Demo League' },
    season: { slug: '2026-27', name: '2026/27' },
    homeTeam: teams[3],
    awayTeam: teams[0],
    kickoffAt: '2026-09-09T15:00:00Z',
    status: FixtureStatus.Completed,
    homeScore: 0,
    awayScore: 3,
    venue: 'Coastal Arena',
  },
  {
    id: 'fixture-4',
    slug: 'northstar-athletic-vs-valley-rovers-2026-11-01',
    competition: { slug: 'continental-demo-league', name: 'Continental Demo League' },
    season: { slug: '2026-27', name: '2026/27' },
    homeTeam: teams[1],
    awayTeam: teams[2],
    kickoffAt: '2026-11-01T15:00:00Z',
    status: FixtureStatus.Scheduled,
    homeScore: null,
    awayScore: null,
    venue: 'Northstar Stadium',
  },
]
const players: PlayerSummary[] = [
  { id: 'player-1', displayName: 'Ari Ndlovu', slug: 'ari-ndlovu', team: teams[0] },
  { id: 'player-2', displayName: 'Mika Dlamini', slug: 'mika-dlamini', team: teams[1] },
  { id: 'player-3', displayName: 'Jordan Naidoo', slug: 'jordan-naidoo', team: teams[2] },
  { id: 'player-4', displayName: 'Lebo Maseko', slug: 'lebo-maseko', team: teams[3] },
]
const fixtureStandings = fixtures.map((fixture) => ({
  id: fixture.id,
  competitionId: fixture.competition.slug,
  seasonId: fixture.season.slug,
  homeTeamId: fixture.homeTeam.id,
  awayTeamId: fixture.awayTeam.id,
  homeScore: fixture.homeScore,
  awayScore: fixture.awayScore,
  status: fixture.status,
}))

@Injectable()
export class SportDataService {
  constructor(private readonly cache = new CacheService()) {}
  listTeams(page = 1, limit = 25) {
    const params = pageParams(page, limit)
    const start = (params.page - 1) * params.limit
    return {
      data: teams.slice(start, start + params.limit),
      pagination: pagination(params.page, params.limit, teams.length),
    }
  }
  team(slug: string) {
    const value = teams.find((item) => item.slug === slug)
    if (!value) throw notFound('team', 'TEAM_NOT_FOUND')
    return value
  }
  teamFixtures(slug: string, results = false) {
    this.team(slug)
    return fixtures.filter(
      (item) =>
        (item.homeTeam.slug === slug || item.awayTeam.slug === slug) &&
        (!results || item.status === FixtureStatus.Completed),
    )
  }
  listPlayers(page = 1, limit = 25) {
    const params = pageParams(page, limit)
    return {
      data: players.slice((params.page - 1) * params.limit, params.page * params.limit),
      pagination: pagination(params.page, params.limit, players.length),
    }
  }
  player(slug: string) {
    const value = players.find((item) => item.slug === slug)
    if (!value) throw notFound('player', 'PLAYER_NOT_FOUND')
    return value
  }
  fixture(id: string) {
    const value = fixtures.find((item) => item.id === id)
    if (!value) throw notFound('fixture', 'FIXTURE_NOT_FOUND')
    return value
  }
  async standings(competitionSlug: string, seasonSlug: string) {
    const key = `standings:${competitionSlug}:${seasonSlug}`
    const cached = await this.cache.get<unknown[]>(key)
    if (cached) return cached
    const result = calculateStandings(teams, fixtureStandings, competitionSlug, seasonSlug)
    await this.cache.set(key, result, 60)
    return result
  }
  competitions() {
    return [
      {
        name: 'Continental Demo League',
        slug: 'continental-demo-league',
        shortName: 'CDL',
        type: 'league',
        country: 'South Africa',
        status: 'active',
      },
    ]
  }
  seasons() {
    return [{ name: '2026/27', slug: '2026-27', status: 'active', startDate: '2026-08-01', endDate: '2027-05-31' }]
  }
  allFixtures() {
    return fixtures
  }
  stats() {
    return {
      topScorers: [{ player: players[0], goals: 3 }],
      topAssists: [{ player: players[1], assists: 2 }],
      cleanSheets: [{ team: teams[0], cleanSheets: 1 }],
    }
  }
}
