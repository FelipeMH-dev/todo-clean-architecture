import { Injectable, LoggerService } from '@nestjs/common';
import { winstonConfig } from './winston.logger';

export interface LogContext {
  context?: string;
  route?: string;
  message?: string;
  extra?: Record<string, unknown>;
  status?: number;
}

@Injectable()
export class AppLogger implements LoggerService {
  log(message: string, options?: LogContext): void {
    winstonConfig.info(this.formatMessage(message, options));
  }

  error(message: string, trace?: string, options?: LogContext): void {
    winstonConfig.error({
      ...this.formatMessage(message, options),
      trace,
    });
  }

  warn(message: string, options?: LogContext): void {
    winstonConfig.warn(this.formatMessage(message, options));
  }

  debug(message: string, options?: LogContext): void {
    winstonConfig.debug(this.formatMessage(message, options));
  }

  verbose(message: string, options?: LogContext): void {
    winstonConfig.verbose(this.formatMessage(message, options));
  }

  private formatMessage(message: string, options?: LogContext) {
    return {
      message,
      context: options?.context,
      route: options?.route,
      extra: options?.extra,
      status: options?.status,
    };
  }
}