import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import type { Response } from 'express'
import { SportLensError } from './errors.js'
@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    if (error instanceof SportLensError)
      return response
        .status(error.statusCode)
        .json({ statusCode: error.statusCode, code: error.code, message: error.message })
    if (error instanceof HttpException) {
      const status = error.getStatus()
      const body = error.getResponse()
      const message =
        typeof body === 'object' && body && 'message' in body
          ? (body as { message: string | string[] }).message
          : String(body)
      return response.status(status).json({
        statusCode: status,
        code: status === 401 ? 'API_KEY_REQUIRED' : 'REQUEST_INVALID',
        message: Array.isArray(message) ? message.join(', ') : message,
      })
    }
    return response
      .status(500)
      .json({ statusCode: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' })
  }
}
