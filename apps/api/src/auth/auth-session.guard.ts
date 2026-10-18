import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'
import { auth } from './auth.js'

export type AuthenticatedRequest = Request & {
  authSession?: Awaited<ReturnType<typeof auth.api.getSession>>
}

@Injectable()
export class AuthSessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
    if (!session)
      throw new HttpException(
        { statusCode: 401, code: 'AUTHENTICATION_REQUIRED', message: 'A valid session is required.' },
        401,
      )
    request.authSession = session
    return true
  }
}

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const session = request.authSession ?? (await auth.api.getSession({ headers: fromNodeHeaders(request.headers) }))
    if (!session)
      throw new HttpException(
        { statusCode: 401, code: 'AUTHENTICATION_REQUIRED', message: 'A valid session is required.' },
        401,
      )
    if (!session.user.emailVerified)
      throw new HttpException(
        { statusCode: 403, code: 'EMAIL_VERIFICATION_REQUIRED', message: 'Verify your email before continuing.' },
        403,
      )
    request.authSession = session
    return true
  }
}
