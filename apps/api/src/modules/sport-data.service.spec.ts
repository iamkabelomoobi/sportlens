import { describe, expect, it } from 'vitest'
import { SportDataService } from './sport-data.service.js'
describe('SportDataService', () => {
  it('returns fixture-derived standings and consumer-safe team data', async () => {
    const service = new SportDataService()
    expect(service.team('riverstone-city')).toMatchObject({ name: 'Riverstone City', slug: 'riverstone-city' })
    const standings = await service.standings('continental-demo-league', '2026-27')
    expect(standings[0]).toMatchObject({ team: { slug: 'riverstone-city' }, points: 6, goalsFor: 5 })
  })
  it('throws a stable not-found error', () => {
    expect(() => new SportDataService().team('missing')).toThrow('could not be found')
  })
})
