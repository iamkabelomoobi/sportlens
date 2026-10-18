import { describe, expect, it } from 'vitest'
import { ApiKeyService } from './api-key.service.js'
describe('ApiKeyService', () => {
  it('generates a raw key that verifies only against its hash', () => {
    const service = new ApiKeyService()
    const generated = service.generate()
    expect(generated.raw).not.toBe(generated.hash)
    expect(
      service.verify(generated.raw, {
        id: 'consumer',
        name: 'Demo',
        ownerId: 'customer',
        role: 'customer',
        apiKeyHash: generated.hash,
        status: 'active',
        rateLimit: 100,
        plan: 'free',
        dailyCount: 0,
        dailyDate: '',
      }),
    ).toBe(true)
    expect(
      service.verify('wrong', {
        id: 'consumer',
        name: 'Demo',
        ownerId: 'customer',
        role: 'customer',
        apiKeyHash: generated.hash,
        status: 'active',
        rateLimit: 100,
        plan: 'free',
        dailyCount: 0,
        dailyDate: '',
      }),
    ).toBe(false)
  })
  it('rejects inactive consumers', () => {
    const service = new ApiKeyService()
    const generated = service.generate()
    expect(
      service.verify(generated.raw, {
        id: 'consumer',
        name: 'Demo',
        ownerId: 'customer',
        role: 'customer',
        apiKeyHash: generated.hash,
        status: 'inactive',
        rateLimit: 100,
        plan: 'free',
        dailyCount: 0,
        dailyDate: '',
      }),
    ).toBe(false)
  })
  it('limits each customer key to 100 requests per UTC day', () => {
    const service = new ApiKeyService()
    const generated = service.generate()
    const record = service.register({ name: 'Demo app', ownerId: 'customer-1', role: 'customer', ...generated })
    for (let index = 0; index < 100; index += 1)
      expect(service.consume(record.id, new Date('2026-10-16T12:00:00Z'))).toBe(true)
    expect(service.consume(record.id, new Date('2026-10-16T12:01:00Z'))).toBe(false)
    expect(service.consume(record.id, new Date('2026-10-17T00:00:00Z'))).toBe(true)
  })
  it('finds the single active customer key for an owner', () => {
    const service = new ApiKeyService()
    const first = service.generate()
    const second = service.generate()
    const firstRecord = service.register({ name: 'First app', ownerId: 'customer-1', role: 'customer', ...first })
    const secondRecord = service.register({ name: 'Second app', ownerId: 'customer-1', role: 'customer', ...second })
    expect(service.activeForOwner('customer-1')?.id).toBe(firstRecord.id)
    service.revoke(firstRecord.id, 'customer-1', false)
    expect(service.activeForOwner('customer-1')?.id).toBe(secondRecord.id)
  })
  it('allows an owner to revoke their own key', () => {
    const service = new ApiKeyService()
    const generated = service.generate()
    const record = service.register({ name: 'Demo app', ownerId: 'customer-1', role: 'customer', ...generated })
    expect(service.revoke(record.id, 'customer-1', false)).toBe(true)
    expect(service.get(record.id)?.status).toBe('inactive')
  })
})
