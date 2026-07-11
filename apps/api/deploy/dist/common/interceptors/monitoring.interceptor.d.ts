import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MonitoringService } from '../../modules/monitoring/monitoring.service';
export declare class MonitoringInterceptor implements NestInterceptor {
    private readonly monitoring;
    constructor(monitoring: MonitoringService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
