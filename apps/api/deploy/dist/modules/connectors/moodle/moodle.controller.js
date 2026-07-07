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
exports.MoodleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const moodle_service_1 = require("./moodle.service");
let MoodleController = class MoodleController {
    moodleService;
    constructor(moodleService) {
        this.moodleService = moodleService;
    }
    async connect(config, tenantId) {
        return this.moodleService.connect(config, tenantId);
    }
    async list(tenantId) {
        return this.moodleService.listConnections(tenantId);
    }
    async sync(id) {
        return this.moodleService.sync(id);
    }
    async disconnect(id) {
        return this.moodleService.disconnect(id);
    }
};
exports.MoodleController = MoodleController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect to a Moodle instance via LTI' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MoodleController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List Moodle connections' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoodleController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sync data from a Moodle connection' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoodleController.prototype, "sync", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect a Moodle instance' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoodleController.prototype, "disconnect", null);
exports.MoodleController = MoodleController = __decorate([
    (0, swagger_1.ApiTags)('Connectors - Moodle'),
    (0, common_1.Controller)('connectors/moodle'),
    __metadata("design:paramtypes", [moodle_service_1.MoodleService])
], MoodleController);
