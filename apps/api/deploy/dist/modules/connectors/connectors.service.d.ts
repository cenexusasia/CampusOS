import { PrismaService } from '../../prisma/prisma.service';
import { ConnectorRegistry } from './connectors.registry';
import type { ConnectorPlugin, ConnectorStatus } from './connector.interface';
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
    private readonly registry;
    private readonly logger;
    constructor(prisma: PrismaService, registry: ConnectorRegistry);
    listByTenant(tenantId: string): Promise<ConnectorListItem[]>;
    getConnectorStatuses(tenantId: string): Promise<ConnectorStatus[]>;
    getConnector(provider: string): ConnectorPlugin | undefined;
    private stripSecrets;
}
