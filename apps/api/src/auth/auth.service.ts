import { HttpException, Injectable } from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'
import { auth } from './auth.js'

@Injectable()
export class AuthService {
  async getSession(request: Request) {
    return auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
  }

  async requireSession(request: Request) {
    const session = await this.getSession(request)
    if (!session)
      throw new HttpException(
        { statusCode: 401, code: 'AUTHENTICATION_REQUIRED', message: 'A valid session is required.' },
        401,
      )
    return session
  }

  async requireVerifiedSession(request: Request) {
    const session = await this.requireSession(request)
    if (!session.user.emailVerified)
      throw new HttpException(
        { statusCode: 403, code: 'EMAIL_VERIFICATION_REQUIRED', message: 'Verify your email before continuing.' },
        403,
      )
    return session
  }

  async requireOrganizationRole(request: Request, organizationId: string) {
    const session = await this.requireVerifiedSession(request)
    const organization = await auth.api.getFullOrganization({
      headers: fromNodeHeaders(request.headers),
      query: { organizationId },
    })
    const member = organization?.members?.find((candidate) => candidate.userId === session.user.id)
    if (!member)
      throw new HttpException(
        {
          statusCode: 403,
          code: 'ORGANIZATION_ACCESS_REQUIRED',
          message: 'You are not a member of this organization.',
        },
        403,
      )
    return { session, role: member.role }
  }
}
