export interface MetricEvent {
    name: string;
    value: number;
    tags?: Record<string, string>;
    timestamp?: Date;
}
export declare class MonitoringService {
    private readonly logger;
    private metrics;
    track(event: MetricEvent): void;
    getMetrics(): MetricEvent[];
    getMetricsSummary(): Record<string, {
        count: number;
        total: number;
        avg: number;
    }>;
    trackRequest(method: string, path: string, durationMs: number, statusCode: number): void;
    trackQuery(operation: string, durationMs: number): void;
    trackError(service: string, error: string): void;
}
