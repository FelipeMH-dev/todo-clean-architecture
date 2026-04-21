import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger, LogContext } from '../logger/logger.service';

interface ExceptionMeta {
  name?: string;
  message?: string;
  stack?: string;
  info?: string;
}

@Catch(HttpException, Error)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const typedRes = res as Partial<{ error: string; message: string }>;
        message = typedRes.message ?? 'Unexpected error occurred';
        errorCode = typedRes.error ?? 'ERROR';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const meta: ExceptionMeta =
      exception instanceof Error
        ? {
            name: exception.name,
            message: exception.message,
            stack: exception.stack,
          }
        : {
            info: 'Unknown non-error exception',
          };

    const logContext: LogContext = {
      context: 'AllExceptionsFilter',
      route: request.url,
      extra: meta as Record<string, unknown>,
      status: status
    };

    this.logger.error(
      `[${request.method}] ${request.url} → ${message}`,
      undefined, // trace
      logContext,
    );

    response.status(status).json({
      error: errorCode,
      message,
      code: status
    });
  }
}
