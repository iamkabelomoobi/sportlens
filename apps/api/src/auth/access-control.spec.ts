import { describe, expect, it } from 'vitest'
import {
  canCreateApplication,
  canManageApiKeys,
  canManageMembers,
  canManageOrganization,
  canViewUsage,
  roleCan,
} from './access-control.js'

describe('SportLens organization authorization', () => {
  it('keeps role decisions centralized', () => {
    expect(canManageOrganization('owner')).toBe(true)
    expect(canManageOrganization('admin')).toBe(false)
    expect(canManageMembers('admin')).toBe(true)
    expect(canCreateApplication('developer')).toBe(true)
    expect(canManageApiKeys('viewer')).toBe(false)
    expect(canViewUsage('viewer')).toBe(true)
    expect(roleCan('not-a-role', 'apiKey', 'create')).toBe(false)
  })
})
