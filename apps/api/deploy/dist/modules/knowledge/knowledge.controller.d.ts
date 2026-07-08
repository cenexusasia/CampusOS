import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    upload(req: any, file: Express.Multer.File): Promise<any>;
    search(req: any, query: string): Promise<any[]>;
    getDocuments(req: any): Promise<any[]>;
    deleteDocument(req: any, id: string): Promise<{
        id: string;
    }>;
}
