import { MonitoringService } from './monitoring.service';
export declare class MonitoringController {
    private readonly monitoring;
    constructor(monitoring: MonitoringService);
    getMetrics(): Record<string, {
        count: number;
        total: number;
        avg: number;
    }>;
}
