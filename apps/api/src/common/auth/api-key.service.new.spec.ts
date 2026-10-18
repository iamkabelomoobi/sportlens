import { describe, expect, it } from 'vitest'
import { ApiKeyService } from './api-key.service.js'

describe('application API keys', () => {
  it('creates application-scoped keys and never stores the raw secret', () => {
    const service = new ApiKeyService()
    const created = service.create({
      applicationId: 'app-1',
      organizationId: 'org-1',
      name: 'Production',
      environment: 'production',
    })

    expect(created.raw).toMatch(/^sportlens_live_[A-Za-z0-9_-]+$/)
    expect(service.get(created.record.id)).not.toHaveProperty('raw')
    expect(service.findByRaw(created.raw)?.id).toBe(created.record.id)
  })

  it('rejects revoked and expired keys', () => {
    const service = new ApiKeyService()
    const created = service.create({
      applicationId: 'app-1',
      organizationId: 'org-1',
      name: 'Test',
      environment: 'test',
      expiresAt: new Date('2020-01-01'),
    })
    expect(service.findByRaw(created.raw)).toBeUndefined()

    const active = service.create({
      applicationId: 'app-1',
      organizationId: 'org-1',
      name: 'Active',
      environment: 'test',
    })
    expect(service.revoke(active.record.id)).toBe(true)
    expect(service.findByRaw(active.raw)).toBeUndefined()
  })

  it('rotates by revoking the old key and returning one new raw secret', () => {
    const service = new ApiKeyService()
    const first = service.create({ applicationId: 'app-1', organizationId: 'org-1', name: 'Test', environment: 'test' })
    const second = service.rotate(first.record.id)
    expect(second.raw).toMatch(/^sportlens_test_/)
    expect(service.findByRaw(first.raw)).toBeUndefined()
    expect(service.findByRaw(second.raw)?.id).toBe(second.record.id)
  })
})
