import { PrismaService } from '../../../prisma/prisma.service';
import type { ConnectorPlugin, ConnectionResult, SyncResult, ConnectorStatus } from '../connector.interface';
export interface ERPNextConfig {
    baseUrl: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiSecret?: string;
}
export interface ERPNextConnection {
    id: string;
    tenantId: string;
    type: string;
    name: string;
    provider: string;
    status: string;
    config: unknown;
    lastSync: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ERPNextService implements ConnectorPlugin {
    private readonly prisma;
    readonly provider = "erpnext";
    readonly name = "ERPNext";
    readonly capabilities: {
        sync: boolean;
        webhook: boolean;
        oauth: boolean;
        basicAuth: boolean;
        apiKey: boolean;
    };
    private readonly logger;
    constructor(prisma: PrismaService);
    private buildHeaders;
    private apiRequest;
    connect(config: ERPNextConfig, tenantId?: string): Promise<ConnectionResult>;
    listConnections(tenantId: string): Promise<ERPNextConnection[]>;
    list(tenantId: string): Promise<ConnectorStatus[]>;
    disconnect(connectionId: string): Promise<void>;
    private syncInvoices;
    private syncPurchaseOrders;
    private syncEmployees;
    private syncSalarySlips;
    sync(connectionId: string): Promise<SyncResult>;
}
