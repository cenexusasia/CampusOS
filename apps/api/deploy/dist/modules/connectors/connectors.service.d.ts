import { PrismaService } from '../../prisma/prisma.service';
export interface ConnectorListItem {
    id: string;
    provider: string;
    name: string;
    status: string;
    lastSyncAt: Date | null;
    config: Record<string, unknown>;
}
export declare class ConnectorsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listByTenant(tenantId: string): Promise<ConnectorListItem[]>;
    private stripSecrets;
}
