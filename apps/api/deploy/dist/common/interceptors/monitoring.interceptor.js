"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const monitoring_service_1 = require("../../modules/monitoring/monitoring.service");
let MonitoringInterceptor = class MonitoringInterceptor {
    monitoring;
    constructor(monitoring) {
        this.monitoring = monitoring;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const path = request.route?.path || request.url;
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const duration = Date.now() - start;
                const response = context.switchToHttp().getResponse();
                this.monitoring.trackRequest(method, path, duration, response.statusCode);
            },
            error: (err) => {
                const duration = Date.now() - start;
                this.monitoring.trackRequest(method, path, duration, err.status || 500);
                this.monitoring.trackError('api', err.message);
            },
        }));
    }
};
exports.MonitoringInterceptor = MonitoringInterceptor;
exports.MonitoringInterceptor = MonitoringInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringInterceptor);
