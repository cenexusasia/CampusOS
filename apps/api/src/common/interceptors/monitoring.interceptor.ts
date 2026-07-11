import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MonitoringService } from '../../modules/monitoring/monitoring.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private readonly monitoring: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const response = context.switchToHttp().getResponse();
          this.monitoring.trackRequest(
            method,
            path,
            duration,
            response.statusCode,
          );
        },
        error: (err: any) => {
          const duration = Date.now() - start;
          this.monitoring.trackRequest(
            method,
            path,
            duration,
            err.status || 500,
          );
          this.monitoring.trackError('api', err.message);
        },
      }),
    );
  }
}
