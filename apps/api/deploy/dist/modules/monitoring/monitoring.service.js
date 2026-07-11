"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    logger = new common_1.Logger(MonitoringService_1.name);
    metrics = [];
    track(event) {
        this.metrics.push(event);
        if (event.value > 0) {
            this.logger.debug(`[Metric] ${event.name}: ${event.value}`);
        }
    }
    getMetrics() {
        return [...this.metrics];
    }
    getMetricsSummary() {
        const summary = {};
        for (const m of this.metrics) {
            if (!summary[m.name])
                summary[m.name] = { count: 0, total: 0, avg: 0 };
            summary[m.name].count++;
            summary[m.name].total += m.value;
            summary[m.name].avg =
                summary[m.name].total / summary[m.name].count;
        }
        return summary;
    }
    trackRequest(method, path, durationMs, statusCode) {
        this.track({
            name: 'http_request_duration_ms',
            value: durationMs,
            tags: { method, path, status: String(statusCode) },
        });
    }
    trackQuery(operation, durationMs) {
        this.track({
            name: 'db_query_duration_ms',
            value: durationMs,
            tags: { operation },
        });
    }
    trackError(service, error) {
        this.track({
            name: 'error_count',
            value: 1,
            tags: { service, error: error.substring(0, 100) },
        });
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)()
], MonitoringService);
