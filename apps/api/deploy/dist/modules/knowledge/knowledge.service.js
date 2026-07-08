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
const pdf_parse_1 = require("pdf-parse");
const mammoth = __importStar(require("mammoth"));
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
        try {
            const text = await this.extractText(file.buffer, file.mimetype);
            const chunks = this.chunkText(text, 1000);
            if (chunks.length > 0) {
                await this.prisma.documentChunk.createMany({
                    data: chunks.map((content, index) => ({
                        documentId: document.id,
                        content,
                        chunkIndex: index,
                        metadata: {},
                    })),
                });
                this.logger.log(`Created ${chunks.length} chunks for document ${document.id}`);
            }
            await this.prisma.document.update({
                where: { id: document.id },
                data: { status: 'READY' },
            });
        }
        catch (error) {
            this.logger.error(`Text extraction failed for document ${document.id}: ${error.message}`);
            await this.prisma.document.update({
                where: { id: document.id },
                data: { status: 'FAILED' },
            });
        }
        return this.prisma.document.findUnique({
            where: { id: document.id },
            include: { _count: { select: { chunks: true } } },
        });
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
    async extractText(buffer, mimeType) {
        switch (mimeType) {
            case 'application/pdf': {
                const parser = new pdf_parse_1.PDFParse(buffer);
                const result = await parser.getText();
                return result.text;
            }
            case 'text/plain':
            case 'text/markdown':
                return buffer.toString('utf-8');
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            }
            default:
                this.logger.warn(`Unsupported mime type: ${mimeType}, falling back to raw text`);
                return buffer.toString('utf-8');
        }
    }
    chunkText(text, maxChunkSize) {
        const normalized = text.replace(/\r\n/g, '\n').trim();
        if (!normalized)
            return [];
        const paragraphs = normalized.split(/\n\s*\n/);
        const chunks = [];
        let currentChunk = '';
        for (const paragraph of paragraphs) {
            const trimmedParagraph = paragraph.trim();
            if (!trimmedParagraph)
                continue;
            if (trimmedParagraph.length > maxChunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                const sentences = trimmedParagraph.match(/[^.!?\n]+[.!?]*\s*/g) || [
                    trimmedParagraph,
                ];
                let sentenceChunk = '';
                for (const sentence of sentences) {
                    if ((sentenceChunk + sentence).length > maxChunkSize) {
                        if (sentenceChunk) {
                            chunks.push(sentenceChunk.trim());
                            sentenceChunk = sentence;
                        }
                        else {
                            chunks.push(sentence.trim());
                            sentenceChunk = '';
                        }
                    }
                    else {
                        sentenceChunk += sentence;
                    }
                }
                if (sentenceChunk) {
                    chunks.push(sentenceChunk.trim());
                }
                continue;
            }
            const separator = currentChunk ? '\n\n' : '';
            const candidate = currentChunk + separator + trimmedParagraph;
            if (candidate.length <= maxChunkSize) {
                currentChunk = candidate;
            }
            else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    const overlap = currentChunk.length > 50
                        ? currentChunk.slice(-50)
                        : currentChunk;
                    currentChunk = overlap + '\n\n' + trimmedParagraph;
                }
                else {
                    currentChunk = trimmedParagraph;
                }
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = KnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeService);
