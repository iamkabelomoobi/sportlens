import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { roleCan } from './access-control.js'
import type { AuthenticatedRequest } from './auth-session.guard.js'

export const REQUIRED_PERMISSION = 'sportlens_required_permission'
export const RequirePermission = (
  resource: 'organization' | 'member' | 'application' | 'apiKey' | 'usage',
  action: string,
) => SetMetadata(REQUIRED_PERMISSION, { resource, action })

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<{ resource: Parameters<typeof roleCan>[1]; action: string }>(
      REQUIRED_PERMISSION,
      [context.getHandler(), context.getClass()],
    )
    if (!required) return true
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    // Organization membership is resolved by the organization service at the boundary.
    // This guard only accepts the role attached by that service; it never embeds role checks in controllers.
    const memberRole = (request as AuthenticatedRequest & { organizationRole?: string }).organizationRole
    if (!memberRole || !roleCan(memberRole, required.resource, required.action))
      throw new ForbiddenException('You do not have permission to perform this action.')
    return true
  }
}
