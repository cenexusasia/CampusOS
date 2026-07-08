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
exports.ERPNextController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const erpnext_service_1 = require("./erpnext.service");
let ERPNextController = class ERPNextController {
    erpnextService;
    constructor(erpnextService) {
        this.erpnextService = erpnextService;
    }
    async connect(config, tenantId) {
        return this.erpnextService.connect(config, tenantId);
    }
    async list(tenantId) {
        return this.erpnextService.listConnections(tenantId);
    }
    async sync(id) {
        return this.erpnextService.sync(id);
    }
    async disconnect(id) {
        return this.erpnextService.disconnect(id);
    }
};
exports.ERPNextController = ERPNextController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect to an ERPNext instance' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ERPNextController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List ERPNext connections' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ERPNextController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sync financial and HR data from an ERPNext connection' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ERPNextController.prototype, "sync", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect an ERPNext instance' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ERPNextController.prototype, "disconnect", null);
exports.ERPNextController = ERPNextController = __decorate([
    (0, swagger_1.ApiTags)('Connectors - ERPNext'),
    (0, common_1.Controller)('connectors/erpnext'),
    __metadata("design:paramtypes", [erpnext_service_1.ERPNextService])
], ERPNextController);
