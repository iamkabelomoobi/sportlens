import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { Injectable } from '@nestjs/common'

export type ApiKeyEnvironment = 'test' | 'production'
export type ApiKeyStatus = 'active' | 'revoked'
export type ApiPlan = 'free' | 'developer' | 'business' | 'enterprise'

export interface ApiKeyRecord {
  id: string
  applicationId: string
  organizationId: string
  name: string
  environment: ApiKeyEnvironment
  keyHash: string
  keyPreview: string
  status: ApiKeyStatus
  createdAt: Date
  lastUsedAt?: Date
  expiresAt?: Date
  permissions: string[]
  rateLimit: number
  plan: ApiPlan
}

export interface CreatedApiKey {
  raw: string
  record: ApiKeyRecord
}

/** @deprecated Compatibility shape for the first local API-key prototype. */
export interface ApiConsumerRecord {
  id: string
  name: string
  ownerId: string
  role: 'admin' | 'customer'
  apiKeyHash: string
  status: 'active' | 'inactive'
  rateLimit: number
  plan: string
  dailyCount: number
  dailyDate: string
}

const planLimits: Record<ApiPlan, number> = { free: 1_000, developer: 50_000, business: 500_000, enterprise: 5_000_000 }

@Injectable()
export class ApiKeyService {
  private readonly records = new Map<string, ApiKeyRecord>()
  private readonly usage = new Map<string, { period: string; count: number }>()
  private readonly legacyRecords = new Map<string, ApiConsumerRecord>()

  static hash(raw: string) {
    return createHash('sha256').update(raw).digest('hex')
  }

  hash(raw: string) {
    return ApiKeyService.hash(raw)
  }

  create(input: {
    applicationId: string
    organizationId: string
    name: string
    environment: ApiKeyEnvironment
    expiresAt?: Date
    permissions?: string[]
    plan?: ApiPlan
  }): CreatedApiKey {
    const raw = `sportlens_${input.environment === 'production' ? 'live' : 'test'}_${randomBytes(32).toString('base64url')}`
    const record: ApiKeyRecord = {
      id: randomBytes(16).toString('hex'),
      applicationId: input.applicationId,
      organizationId: input.organizationId,
      name: input.name.trim() || 'SportLens API key',
      environment: input.environment,
      keyHash: this.hash(raw),
      keyPreview: `sportlens_${input.environment === 'production' ? 'live' : 'test'}_••••••••${raw.slice(-4)}`,
      status: 'active',
      createdAt: new Date(),
      expiresAt: input.expiresAt,
      permissions: input.permissions ?? ['read:sports-data'],
      plan: input.plan ?? 'free',
      rateLimit: planLimits[input.plan ?? 'free'],
    }
    this.records.set(record.id, record)
    return { raw, record: { ...record, keyHash: '' } }
  }

  findByRaw(raw: string, now = new Date()) {
    if (!raw || !/^sportlens_(test|live)_/.test(raw)) return undefined
    const hash = this.hash(raw)
    return [...this.records.values()].find((record) => {
      if (record.status !== 'active' || (record.expiresAt && record.expiresAt <= now)) return false
      const expected = Buffer.from(record.keyHash, 'hex')
      const actual = Buffer.from(hash, 'hex')
      return expected.length === actual.length && timingSafeEqual(expected, actual)
    })
  }

  get(id: string): ApiKeyRecord | ApiConsumerRecord | undefined {
    const record = this.records.get(id)
    if (record) return { ...record, keyHash: '' }
    return this.legacyRecords.get(id)
  }

  all() {
    return [...this.records.values()].map((record) => ({ ...record, keyHash: '' }))
  }

  rename(id: string, name: string) {
    const record = this.records.get(id)
    if (!record || record.status !== 'active' || !name.trim()) return false
    record.name = name.trim()
    return true
  }

  revoke(id: string, actorId?: string, actorIsAdmin = false) {
    const record = this.records.get(id)
    if (record) {
      record.status = 'revoked'
      return true
    }
    return this.revokeLegacy(id, actorId ?? '', actorIsAdmin)
  }

  rotate(id: string): CreatedApiKey {
    const record = this.records.get(id)
    if (!record) throw new Error('API key not found')
    this.revoke(id)
    return this.create({
      applicationId: record.applicationId,
      organizationId: record.organizationId,
      name: record.name,
      environment: record.environment,
      expiresAt: record.expiresAt,
      permissions: record.permissions,
      plan: record.plan,
    })
  }

  consume(record: ApiKeyRecord | string, now = new Date()) {
    if (typeof record === 'string') {
      const legacy = this.legacyRecords.get(record)
      if (!legacy || legacy.status !== 'active') return false
      const period = now.toISOString().slice(0, 10)
      if (legacy.dailyDate !== period) {
        legacy.dailyDate = period
        legacy.dailyCount = 0
      }
      if (legacy.dailyCount >= legacy.rateLimit) return false
      legacy.dailyCount += 1
      return true
    }
    const period = now.toISOString().slice(0, 7)
    const current = this.usage.get(record.id)
    const next = !current || current.period !== period ? { period, count: 0 } : current
    if (next.count >= record.rateLimit) return false
    next.count += 1
    this.usage.set(record.id, next)
    const persisted = this.records.get(record.id)
    if (persisted) persisted.lastUsedAt = now
    return true
  }

  generate() {
    const raw = `sportlens_test_${randomBytes(32).toString('base64url')}`
    return { raw, hash: this.hash(raw) }
  }

  register(input: { name: string; ownerId: string; role: 'admin' | 'customer'; raw: string; hash: string }) {
    const record: ApiConsumerRecord = {
      id: randomBytes(12).toString('hex'),
      name: input.name,
      ownerId: input.ownerId,
      role: input.role,
      apiKeyHash: input.hash,
      status: 'active',
      rateLimit: 100,
      plan: 'free',
      dailyCount: 0,
      dailyDate: '',
    }
    this.legacyRecords.set(record.id, record)
    return record
  }

  verify(raw: string, record: ApiConsumerRecord) {
    if (record.status !== 'active') return false
    const actual = Buffer.from(this.hash(raw), 'hex')
    const expected = Buffer.from(record.apiKeyHash, 'hex')
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  }

  getLegacy(id: string) {
    return this.legacyRecords.get(id)
  }
  activeForOwner(ownerId: string) {
    return [...this.legacyRecords.values()].find(
      (record) => record.ownerId === ownerId && record.role === 'customer' && record.status === 'active',
    )
  }
  findLegacyByRaw(raw: string) {
    return [...this.legacyRecords.values()].find((record) => this.verify(raw, record))
  }
  revokeLegacy(id: string, actorId: string, actorIsAdmin: boolean) {
    const record = this.legacyRecords.get(id)
    if (!record || (!actorIsAdmin && record.ownerId !== actorId)) return false
    record.status = 'inactive'
    return true
  }
}

export { planLimits }
