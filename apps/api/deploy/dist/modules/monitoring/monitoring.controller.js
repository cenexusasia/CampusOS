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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const monitoring_service_1 = require("./monitoring.service");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const shared_1 = require("../../shared");
let MonitoringController = class MonitoringController {
    monitoring;
    constructor(monitoring) {
        this.monitoring = monitoring;
    }
    getMetrics() {
        return this.monitoring.getMetricsSummary();
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(shared_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get metrics summary', description: 'Returns aggregated application metrics (admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Metrics summary',
        schema: {
            type: 'object',
            additionalProperties: {
                type: 'object',
                properties: {
                    count: { type: 'number' },
                    total: { type: 'number' },
                    avg: { type: 'number' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MonitoringController.prototype, "getMetrics", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)('Monitoring'),
    (0, common_1.Controller)('api/v1/metrics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
