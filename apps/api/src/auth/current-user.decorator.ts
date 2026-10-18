import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthenticatedRequest } from './auth-session.guard.js'

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
  return request.authSession?.user
})
