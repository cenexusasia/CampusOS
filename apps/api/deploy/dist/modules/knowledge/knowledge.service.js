"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KnowledgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("../../shared");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const uuid_1 = require("uuid");
let KnowledgeService = KnowledgeService_1 = class KnowledgeService {
    prisma;
    logger = new common_1.Logger(KnowledgeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upload(tenantId, userId, file) {
        if (!file) {
            throw new common_1.BadRequestException({
                code: shared_1.ERROR_CODES.VALIDATION_ERROR,
                message: 'No file provided',
            });
        }
        const uploadDir = path.join(process.cwd(), 'uploads', 'knowledge', tenantId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const extension = path.extname(file.originalname) || '';
        const storageName = `${(0, uuid_1.v4)()}${extension}`;
        const filePath = path.join(uploadDir, storageName);
        fs.writeFileSync(filePath, file.buffer);
        const relativePath = path.join('uploads', 'knowledge', tenantId, storageName);
        const document = await this.prisma.document.create({
            data: {
                tenantId,
                name: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                filePath: relativePath,
                status: 'PROCESSING',
                metadata: {
                    uploadedBy: userId,
                    originalName: file.originalname,
                },
            },
        });
        this.logger.log(`Document uploaded: ${document.id} (${file.originalname})`);
        return document;
    }
    async search(tenantId, query) {
        if (!query || query.trim().length === 0) {
            throw new common_1.BadRequestException({
                code: shared_1.ERROR_CODES.VALIDATION_ERROR,
                message: 'Search query is required',
            });
        }
        const chunks = await this.prisma.documentChunk.findMany({
            where: {
                document: { tenantId },
                content: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            include: {
                document: {
                    select: {
                        id: true,
                        name: true,
                        mimeType: true,
                        status: true,
                    },
                },
            },
            orderBy: { chunkIndex: 'asc' },
            take: 50,
        });
        return chunks.map((chunk) => ({
            id: chunk.id,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            metadata: chunk.metadata,
            document: chunk.document,
            createdAt: chunk.createdAt,
        }));
    }
    async findAll(tenantId) {
        return this.prisma.document.findMany({
            where: { tenantId },
            include: {
                _count: { select: { chunks: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async delete(tenantId, documentId) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, tenantId },
        });
        if (!document) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Document not found',
            });
        }
        const fullPath = path.join(process.cwd(), document.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        await this.prisma.document.delete({
            where: { id: documentId },
        });
        this.logger.log(`Document deleted: ${documentId}`);
        return { id: documentId };
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = KnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeService);
