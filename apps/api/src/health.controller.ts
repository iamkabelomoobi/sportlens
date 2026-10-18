import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PublicRoute } from './common/auth/public-route.decorator.js'
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @PublicRoute()
  @ApiOperation({ summary: 'Check API availability' })
  health() {
    return { data: { status: 'ok', service: 'sportlens-api' } }
  }
}
