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
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const knowledge_service_1 = require("./knowledge.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let KnowledgeController = class KnowledgeController {
    knowledgeService;
    constructor(knowledgeService) {
        this.knowledgeService = knowledgeService;
    }
    async upload(req, file) {
        return this.knowledgeService.upload(req.user.tenantId, req.user.sub, file);
    }
    async search(req, query) {
        return this.knowledgeService.search(req.user.tenantId, query);
    }
    async getDocuments(req) {
        return this.knowledgeService.findAll(req.user.tenantId);
    }
    async deleteDocument(req, id) {
        return this.knowledgeService.delete(req.user.tenantId, id);
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document to the knowledge base' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'The file to upload',
                },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Keyword search across document chunks' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiOperation)({ summary: 'List all documents in the knowledge base' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a document by ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "deleteDocument", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, swagger_1.ApiTags)('Knowledge'),
    (0, common_1.Controller)('knowledge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [knowledge_service_1.KnowledgeService])
], KnowledgeController);
