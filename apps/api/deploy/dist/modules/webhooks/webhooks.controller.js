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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const webhooks_service_1 = require("./webhooks.service");
const register_webhook_dto_1 = require("./dto/register-webhook.dto");
let WebhooksController = class WebhooksController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async register(req, dto) {
        const tenantId = req.user.tenantId;
        if (!tenantId) {
            const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
        }
        return this.webhooksService.register(tenantId, dto.event, dto.url, dto.secret);
    }
    async list(req) {
        const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
        return this.webhooksService.listByTenant(tenantId);
    }
    async unregister(req, id) {
        const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
        const deleted = await this.webhooksService.unregister(id, tenantId);
        if (!deleted) {
            throw new common_1.NotFoundException('Webhook not found');
        }
        return { message: 'Webhook removed successfully' };
    }
    async getLogs(req, id) {
        const tenantId = req.user.tenantId || req.user.tenantIds?.[0];
        const logs = await this.webhooksService.getLogs(id, tenantId);
        return logs;
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a webhook URL for an event type' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Webhook registered successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, register_webhook_dto_1.RegisterWebhookDto]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List webhooks for the current tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhooks retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Webhook not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "unregister", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    (0, swagger_1.ApiOperation)({ summary: 'View delivery logs for a webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logs retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Webhook not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "getLogs", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
