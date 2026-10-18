import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { ApiKeyService, type ApiKeyRecord } from './api-key.service.js'
import { PUBLIC_ROUTE } from './public-route.decorator.js'

export type ApiKeyRequest = Request & { apiClient?: ApiKeyRecord }

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly keys: ApiKeyService,
  ) {}

  canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true
    const request = context.switchToHttp().getRequest<ApiKeyRequest>()
    const raw = request.header('x-api-key')
    const record = raw ? this.keys.findByRaw(raw) : undefined
    if (!record)
      throw new HttpException(
        { statusCode: 401, code: 'API_KEY_REQUIRED', message: 'A valid X-API-Key is required.' },
        401,
      )
    if (!this.keys.consume(record))
      throw new HttpException(
        {
          statusCode: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'The API key monthly request limit has been reached.',
        },
        429,
      )
    request.apiClient = record
    return true
  }
}
