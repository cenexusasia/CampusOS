import { PrismaService } from '../../prisma/prisma.service';
export declare class KnowledgeService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    upload(tenantId: string, userId: string, file: Express.Multer.File): Promise<any>;
    search(tenantId: string, query: string): Promise<any[]>;
    findAll(tenantId: string): Promise<any[]>;
    delete(tenantId: string, documentId: string): Promise<{
        id: string;
    }>;
}
