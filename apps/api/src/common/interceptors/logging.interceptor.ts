import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = request.headers['x-request-id'] as string | undefined;
    const { method, url } = request;
    const startTime = Date.now();

    const logMessage = [
      `→ ${method} ${url}`,
      requestId ? `[${requestId}]` : '',
    ]
      .filter(Boolean)
      .join(' ');

    this.logger.log(logMessage);

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            [
              `← ${method} ${url}`,
              `${statusCode}`,
              `${elapsed}ms`,
              requestId ? `[${requestId}]` : '',
            ]
              .filter(Boolean)
              .join(' '),
          );
        },
        error: (error: Error) => {
          const elapsed = Date.now() - startTime;
          this.logger.warn(
            [
              `← ${method} ${url}`,
              `ERROR`,
              `${elapsed}ms`,
              error.message,
              requestId ? `[${requestId}]` : '',
            ]
              .filter(Boolean)
              .join(' '),
          );
        },
      }),
    );
  }
}
