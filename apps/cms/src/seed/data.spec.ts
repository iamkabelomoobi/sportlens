import { describe, expect, it } from 'vitest'
import { seedData } from './data.js'
describe('SportLens seed data', () => {
  it('contains neutral football demo content sufficient for standings', () => {
    expect(seedData.competition.slug).toBe('continental-demo-league')
    expect(seedData.teams).toHaveLength(4)
    expect(seedData.players.length).toBeGreaterThanOrEqual(4)
    expect(seedData.fixtures.filter((fixture) => fixture.status === 'completed')).toHaveLength(3)
    expect(JSON.stringify(seedData).toLowerCase()).not.toContain('mntezama')
  })
})
