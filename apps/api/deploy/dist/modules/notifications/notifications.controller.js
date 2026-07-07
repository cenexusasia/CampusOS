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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
const notification_preferences_service_1 = require("./notification-preferences.service");
let NotificationsController = class NotificationsController {
    emailService;
    preferencesService;
    constructor(emailService, preferencesService) {
        this.emailService = emailService;
        this.preferencesService = preferencesService;
    }
    async sendEmail(options) {
        return this.emailService.send(options);
    }
    async sendBatch(optionsList) {
        return this.emailService.sendBatch(optionsList);
    }
    async verifyEmail() {
        const connected = await this.emailService.verifyConnection();
        return { connected };
    }
    async getPreferences(userId, tenantId) {
        return this.preferencesService.getPreferences(userId, tenantId);
    }
    async updatePreferences(userId, tenantId, preferences) {
        return this.preferencesService.updatePreferences(userId, tenantId, preferences);
    }
    async resetPreferences(userId, tenantId) {
        return this.preferencesService.resetToDefaults(userId, tenantId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('email/send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send an email notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('email/send-batch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send batch email notifications' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendBatch", null);
__decorate([
    (0, common_1.Get)('email/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email service connection' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification preferences' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Put)('preferences'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification preferences' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('preferences/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset notification preferences to defaults' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "resetPreferences", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        notification_preferences_service_1.NotificationPreferencesService])
], NotificationsController);
