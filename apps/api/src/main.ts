import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { NextFunction, Request, Response } from 'express'
import { AppModule } from './app.module.js'
import { ErrorsFilter } from './common/errors.filter.js'
import { auth } from './auth/auth.js'
import { toNodeHandler } from 'better-auth/node'

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule)
  if (process.env.NODE_ENV !== 'production') {
    app
      .getHttpAdapter()
      .getInstance()
      .use('/api/auth', (request: Request, _response: Response, next: NextFunction) => {
        if (!request.headers['x-forwarded-for'] && !request.headers['x-real-ip']) {
          request.headers['x-real-ip'] = request.ip || '127.0.0.1'
        }
        next()
      })
  }
  app.getHttpAdapter().getInstance().use('/api/auth', toNodeHandler(auth))
  app.setGlobalPrefix('api/v1')
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.useGlobalFilters(new ErrorsFilter())
  const swagger = new DocumentBuilder()
    .setTitle('SportLens API')
    .setDescription('Football data, fixtures, standings and statistics through one platform.')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger))
  await app.listen(Number(process.env.API_PORT ?? 3001))
}
bootstrap()
