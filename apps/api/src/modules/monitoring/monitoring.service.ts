import { Injectable, Logger } from '@nestjs/common';

export interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private metrics: MetricEvent[] = [];

  track(event: MetricEvent) {
    this.metrics.push(event);
    // Log important metrics
    if (event.value > 0) {
      this.logger.debug(`[Metric] ${event.name}: ${event.value}`);
    }
  }

  getMetrics(): MetricEvent[] {
    return [...this.metrics];
  }

  getMetricsSummary() {
    const summary: Record<string, { count: number; total: number; avg: number }> =
      {};
    for (const m of this.metrics) {
      if (!summary[m.name])
        summary[m.name] = { count: 0, total: 0, avg: 0 };
      summary[m.name]!.count++;
      summary[m.name]!.total += m.value;
      summary[m.name]!.avg =
        summary[m.name]!.total / summary[m.name]!.count;
    }
    return summary;
  }

  // Track request duration
  trackRequest(
    method: string,
    path: string,
    durationMs: number,
    statusCode: number,
  ) {
    this.track({
      name: 'http_request_duration_ms',
      value: durationMs,
      tags: { method, path, status: String(statusCode) },
    });
  }

  // Track database queries
  trackQuery(operation: string, durationMs: number) {
    this.track({
      name: 'db_query_duration_ms',
      value: durationMs,
      tags: { operation },
    });
  }

  // Track errors
  trackError(service: string, error: string) {
    this.track({
      name: 'error_count',
      value: 1,
      tags: { service, error: error.substring(0, 100) },
    });
  }
}
