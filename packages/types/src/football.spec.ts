import { describe, expect, it } from 'vitest'
import { CompetitionType, FixtureStatus, MatchEventType, PlayerPosition } from './football.js'

describe('shared football contracts', () => {
  it('exposes stable public enum values', () => {
    expect(CompetitionType.League).toBe('league')
    expect(FixtureStatus.Completed).toBe('completed')
    expect(MatchEventType.Substitution).toBe('substitution')
    expect(PlayerPosition.Goalkeeper).toBe('goalkeeper')
  })
})
