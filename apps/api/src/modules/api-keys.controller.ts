import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { AuthSessionGuard, VerifiedUserGuard } from '../auth/auth-session.guard.js'
import { AuthService } from '../auth/auth.service.js'
import { canManageApiKeys } from '../auth/access-control.js'
import { ApplicationService } from './application.service.js'
import { ApiKeyService, type ApiKeyEnvironment } from '../common/auth/api-key.service.js'

type SessionRequest = Request & { authSession?: { user: { id: string } } }

@ApiTags('dashboard-api-keys')
@Controller('dashboard/api-keys')
@UseGuards(AuthSessionGuard, VerifiedUserGuard)
export class ApiKeysController {
  constructor(
    private readonly keys: ApiKeyService,
    private readonly authService: AuthService,
    private readonly applications: ApplicationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an application-scoped API key; the raw key is returned once.' })
  async create(
    @Body()
    body: {
      applicationId: string
      organizationId: string
      name: string
      environment: ApiKeyEnvironment
      expiresAt?: string
    },
    @Req() request: SessionRequest,
  ) {
    const membership = await this.authService.requireOrganizationRole(request, body.organizationId)
    if (!canManageApiKeys(membership.role))
      throw new ForbiddenException('You do not have permission to manage API keys.')
    const application = this.applications.get(body.applicationId)
    if (!application || application.organizationId !== body.organizationId || application.status !== 'active')
      throw new ForbiddenException('An active application in this organization is required.')
    const created = this.keys.create({ ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined })
    return { data: { ...created.record, apiKey: created.raw } }
  }

  @Get()
  async list(@Req() request: SessionRequest, @Query('organizationId') organizationId?: string) {
    if (!organizationId) return { data: [] }
    await this.authService.requireOrganizationRole(request, organizationId)
    return { data: this.keys.all().filter((key) => key.organizationId === organizationId) }
  }

  @Patch(':id')
  async rename(@Param('id') id: string, @Body() body: { name: string }, @Req() request: SessionRequest) {
    await this.authorizeKey(request, id)
    return { data: { id, updated: this.keys.rename(id, body.name) } }
  }

  @Post(':id/rotate')
  async rotate(@Param('id') id: string, @Req() request: SessionRequest) {
    await this.authorizeKey(request, id)
    const created = this.keys.rotate(id)
    return { data: { ...created.record, apiKey: created.raw } }
  }

  @Delete(':id')
  async revoke(@Param('id') id: string, @Req() request: SessionRequest) {
    await this.authorizeKey(request, id)
    return { data: { id, revoked: this.keys.revoke(id) } }
  }

  private async authorizeKey(request: SessionRequest, id: string) {
    const key = this.keys.get(id)
    if (!key || !('organizationId' in key)) throw new ForbiddenException('API key not found.')
    const membership = await this.authService.requireOrganizationRole(request, key.organizationId)
    if (!canManageApiKeys(membership.role))
      throw new ForbiddenException('You do not have permission to manage API keys.')
  }
}
