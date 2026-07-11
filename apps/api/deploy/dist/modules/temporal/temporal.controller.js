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
exports.TemporalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const temporal_service_1 = require("./temporal.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TemporalController = class TemporalController {
    temporalService;
    constructor(temporalService) {
        this.temporalService = temporalService;
    }
    async startWorkflow(dto) {
        return this.temporalService.startWorkflow(dto);
    }
    async getStatus(id) {
        return this.temporalService.getWorkflowStatus(id);
    }
};
exports.TemporalController = TemporalController;
__decorate([
    (0, common_1.Post)('workflows'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Start a Temporal workflow' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemporalController.prototype, "startWorkflow", null);
__decorate([
    (0, common_1.Get)('workflows/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow execution status' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemporalController.prototype, "getStatus", null);
exports.TemporalController = TemporalController = __decorate([
    (0, swagger_1.ApiTags)('Temporal Workflows'),
    (0, common_1.Controller)('temporal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [temporal_service_1.TemporalService])
], TemporalController);
