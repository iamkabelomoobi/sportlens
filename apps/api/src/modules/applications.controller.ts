import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { AuthService } from '../auth/auth.service.js'
import { AuthSessionGuard, VerifiedUserGuard } from '../auth/auth-session.guard.js'
import { canCreateApplication } from '../auth/access-control.js'
import { ApplicationService, type ApplicationEnvironment } from './application.service.js'

type SessionRequest = Request & { authSession?: { user: { id: string } } }

@ApiTags('dashboard-applications')
@Controller('dashboard/applications')
@UseGuards(AuthSessionGuard, VerifiedUserGuard)
export class ApplicationsController {
  constructor(
    private readonly applications: ApplicationService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      organizationId: string
      name: string
      description?: string
      website?: string
      environment: ApplicationEnvironment
    },
    @Req() request: SessionRequest,
  ) {
    const membership = await this.authService.requireOrganizationRole(request, body.organizationId)
    if (!canCreateApplication(membership.role)) return { data: null }
    return { data: this.applications.create({ ...body, createdBy: request.authSession!.user.id }) }
  }

  @Get()
  async list(@Query('organizationId') organizationId: string, @Req() request: SessionRequest) {
    await this.authService.requireOrganizationRole(request, organizationId)
    return { data: this.applications.list(organizationId) }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; website?: string; environment?: ApplicationEnvironment },
    @Req() request: SessionRequest,
  ) {
    const application = this.applications.get(id)
    if (!application) return { data: null }
    const membership = await this.authService.requireOrganizationRole(request, application.organizationId)
    if (!canCreateApplication(membership.role)) return { data: null }
    return { data: this.applications.update(id, body) }
  }

  @Delete(':id')
  async archive(@Param('id') id: string, @Req() request: SessionRequest) {
    const application = this.applications.get(id)
    if (!application) return { data: { archived: false } }
    const membership = await this.authService.requireOrganizationRole(request, application.organizationId)
    if (!canCreateApplication(membership.role)) return { data: { archived: false } }
    return { data: { archived: this.applications.archive(id) } }
  }
}
