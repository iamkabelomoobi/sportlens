import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common'
import type { ApiKeyRecord, ApiPlan } from '../auth/api-key.service.js'

export const API_PLAN_LIMITS: Record<ApiPlan, number> = {
  free: Number(process.env.SPORTLENS_RATE_FREE ?? 1_000),
  developer: Number(process.env.SPORTLENS_RATE_DEVELOPER ?? 50_000),
  business: Number(process.env.SPORTLENS_RATE_BUSINESS ?? 500_000),
  enterprise: Number(process.env.SPORTLENS_RATE_ENTERPRISE ?? 5_000_000),
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requests = new Map<string, { count: number; reset: number }>()

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ ip?: string; apiClient?: ApiKeyRecord }>()
    const client = request.apiClient
    const key = client?.id ?? request.ip ?? 'anonymous'
    const now = Date.now()
    const entry = this.requests.get(key)
    const current = !entry || entry.reset <= now ? { count: 0, reset: now + 60_000 } : entry
    current.count += 1
    this.requests.set(key, current)
    const limit = client ? API_PLAN_LIMITS[client.plan] : API_PLAN_LIMITS.free
    if (current.count > limit)
      throw new HttpException({ statusCode: 429, code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded.' }, 429)
    return true
  }
}
