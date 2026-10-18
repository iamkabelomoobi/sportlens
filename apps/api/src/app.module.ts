import { Module } from '@nestjs/common'
import { HealthController } from './health.controller.js'
import { SportDataController } from './modules/sport-data.controller.js'
import { SportDataService } from './modules/sport-data.service.js'
import { ApiKeysController } from './modules/api-keys.controller.js'
import { ApiKeyGuard } from './common/auth/api-key.guard.js'
import { ApiKeyService } from './common/auth/api-key.service.js'
import { AuthModule } from './auth/auth.module.js'
import { ApplicationsController } from './modules/applications.controller.js'
import { ApplicationService } from './modules/application.service.js'
import { RateLimitGuard } from './common/rate-limit/rate-limit.guard.js'
@Module({
  imports: [AuthModule],
  controllers: [HealthController, SportDataController, ApiKeysController, ApplicationsController],
  providers: [SportDataService, ApiKeyService, ApiKeyGuard, RateLimitGuard, ApplicationService],
})
export class AppModule {}
