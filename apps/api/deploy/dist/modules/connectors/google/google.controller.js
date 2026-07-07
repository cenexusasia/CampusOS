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
exports.GoogleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const google_service_1 = require("./google.service");
let GoogleController = class GoogleController {
    googleService;
    constructor(googleService) {
        this.googleService = googleService;
    }
    getAuthUrl(tenantId) {
        const config = {
            clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
            redirectUri: process.env['GOOGLE_REDIRECT_URI'] ?? 'http://localhost:3001/api/v1/connectors/google/callback',
            scopes: [],
        };
        return { url: this.googleService.getAuthUrl(config) };
    }
    async handleCallback(code, tenantId) {
        const config = {
            clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
            redirectUri: process.env['GOOGLE_REDIRECT_URI'] ?? 'http://localhost:3001/api/v1/connectors/google/callback',
            scopes: [],
        };
        await this.googleService.exchangeCode(code, config);
        return { success: true };
    }
    async list(tenantId) {
        return this.googleService.listConnections(tenantId);
    }
    async disconnect(id) {
        return this.googleService.disconnect(id);
    }
};
exports.GoogleController = GoogleController;
__decorate([
    (0, common_1.Get)('auth-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google OAuth authorization URL' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], GoogleController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Google OAuth callback' }),
    (0, swagger_1.ApiQuery)({ name: 'code', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List connected Google accounts' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect a Google account' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "disconnect", null);
exports.GoogleController = GoogleController = __decorate([
    (0, swagger_1.ApiTags)('Connectors - Google'),
    (0, common_1.Controller)('connectors/google'),
    __metadata("design:paramtypes", [google_service_1.GoogleService])
], GoogleController);
