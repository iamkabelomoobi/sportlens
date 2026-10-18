import { Module } from '@nestjs/common'
import { AuthSessionGuard, VerifiedUserGuard } from './auth-session.guard.js'
import { AuthService } from './auth.service.js'
import { PermissionsGuard } from './permissions.guard.js'

@Module({
  providers: [AuthService, AuthSessionGuard, VerifiedUserGuard, PermissionsGuard],
  exports: [AuthService, AuthSessionGuard, VerifiedUserGuard, PermissionsGuard],
})
export class AuthModule {}
