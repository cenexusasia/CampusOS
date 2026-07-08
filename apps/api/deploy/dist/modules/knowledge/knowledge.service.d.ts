import { PrismaService } from '../../prisma/prisma.service';
export interface SearchResult {
    id: string;
    content: string;
    chunkIndex: number;
    metadata: any;
    similarity?: number;
    document: {
        id: string;
        name: string;
        mimeType: string;
        status: string;
    };
    createdAt: Date;
}
export declare class KnowledgeService {
    private readonly prisma;
    private readonly logger;
    private readonly embeddingEndpoint;
    constructor(prisma: PrismaService);
    generateEmbedding(text: string): Promise<number[]>;
    ensureVectorColumn(): Promise<void>;
    upload(tenantId: string, userId: string, file: Express.Multer.File): Promise<any>;
    private generateChunkEmbeddings;
    search(tenantId: string, query: string): Promise<SearchResult[]>;
    private semanticSearch;
    private keywordSearch;
    findAll(tenantId: string): Promise<any[]>;
    delete(tenantId: string, documentId: string): Promise<{
        id: string;
    }>;
    private extractText;
    private chunkText;
}
