import { PrismaService } from '../../../prisma/prisma.service';
export interface OpenSISConfig {
    apiUrl: string;
    apiKey: string;
    apiSecret?: string;
    schoolId: string;
    dbHost?: string;
    mysqlHost?: string;
    dbPort?: number;
    mysqlPort?: number;
    dbUser?: string;
    mysqlUser?: string;
    dbPassword?: string;
    mysqlPassword?: string;
    dbName?: string;
    mysqlDatabase?: string;
}
export interface OpenSISConnection {
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
export declare class OpenSISService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private normalizeConfig;
    connect(config: OpenSISConfig, tenantId: string): Promise<{
        success: boolean;
        connectionId: string;
        validatedBy?: string;
    }>;
    listConnections(tenantId: string): Promise<OpenSISConnection[]>;
    disconnect(connectionId: string): Promise<void>;
    private syncViaRestApi;
    private syncViaMySQL;
    private findTable;
    private upsertStudents;
    private upsertStaff;
    private upsertCourses;
    sync(connectionId: string): Promise<{
        studentsSynced: number;
        staffSynced: number;
        coursesSynced: number;
    }>;
}
