import { Redis } from 'ioredis'
export class CacheService {
  private readonly memory = new Map<string, { value: unknown; expires: number }>()
  private readonly redis?: Redis
  constructor(redisUrl?: string) {
    if (redisUrl) this.redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 0 })
  }
  async get<T>(key: string): Promise<T | null> {
    const item = this.memory.get(key)
    if (item && item.expires > Date.now()) return item.value as T
    if (item) this.memory.delete(key)
    if (!this.redis) return null
    try {
      const value = await this.redis.get(key)
      return value ? (JSON.parse(value) as T) : null
    } catch {
      return null
    }
  }
  async set(key: string, value: unknown, ttlSeconds: number) {
    this.memory.set(key, { value, expires: Date.now() + ttlSeconds * 1000 })
    if (this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
      } catch {
        return undefined
      }
    }
  }
  async deleteByPrefix(prefix: string) {
    for (const key of this.memory.keys()) if (key.startsWith(prefix)) this.memory.delete(key)
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${prefix}*`)
        if (keys.length) await this.redis.del(...keys)
      } catch {
        return undefined
      }
    }
  }
}
