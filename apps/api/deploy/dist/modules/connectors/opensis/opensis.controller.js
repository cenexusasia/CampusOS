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
exports.OpenSISController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const opensis_service_1 = require("./opensis.service");
let OpenSISController = class OpenSISController {
    openSISService;
    constructor(openSISService) {
        this.openSISService = openSISService;
    }
    async connect(config, tenantId) {
        return this.openSISService.connect(config, tenantId);
    }
    async list(tenantId) {
        return this.openSISService.listConnections(tenantId);
    }
    async sync(id) {
        return this.openSISService.sync(id);
    }
    async disconnect(id) {
        return this.openSISService.disconnect(id);
    }
};
exports.OpenSISController = OpenSISController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect to an OpenSIS instance' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OpenSISController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List OpenSIS connections' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OpenSISController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sync data from an OpenSIS connection' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OpenSISController.prototype, "sync", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect an OpenSIS instance' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OpenSISController.prototype, "disconnect", null);
exports.OpenSISController = OpenSISController = __decorate([
    (0, swagger_1.ApiTags)('Connectors - OpenSIS'),
    (0, common_1.Controller)('connectors/opensis'),
    __metadata("design:paramtypes", [opensis_service_1.OpenSISService])
], OpenSISController);
