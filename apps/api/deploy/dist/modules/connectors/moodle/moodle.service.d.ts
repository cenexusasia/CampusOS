import type { ConnectorPlugin } from '../connector.interface';
import { PrismaService } from '../../../prisma/prisma.service';
export interface MoodleConfig {
    mysqlHost?: string;
    mysqlUser?: string;
    mysqlPassword?: string;
    mysqlDatabase?: string;
    moodleUrl?: string;
}
export interface MoodleConnection {
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
export declare class MoodleService implements ConnectorPlugin {
    private readonly prisma;
    readonly provider = "MOODLE";
    readonly name = "Moodle";
    readonly capabilities: {
        sync: boolean;
        webhook: boolean;
        oauth: boolean;
        basicAuth: boolean;
        apiKey: boolean;
    };
    private readonly logger;
    constructor(prisma: PrismaService);
    private getConfig;
    private createMysqlConnection;
    connect(config: MoodleConfig, tenantId: string): Promise<{
        success: boolean;
        connectionId: string;
        siteInfo?: unknown;
    }>;
    list(tenantId: string): Promise<ConnectorStatus[]>;
    listConnections(tenantId: string): Promise<MoodleConnection[]>;
    disconnect(connectionId: string): Promise<void>;
    syncCourses(config: MoodleConfig, tenantId: string): Promise<number>;
    syncUsers(config: MoodleConfig, tenantId: string): Promise<number>;
    sync(connectionId: string): Promise<{
        coursesSynced: number;
        usersSynced: number;
    }>;
}
