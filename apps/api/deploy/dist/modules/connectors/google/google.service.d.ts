import type { ConnectorPlugin, ConnectionResult, SyncResult, ConnectorStatus } from '../connector.interface';
export interface GoogleConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}
export interface GoogleConnection {
    id: string;
    tenantId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class GoogleService implements ConnectorPlugin {
    readonly provider = "google";
    readonly name = "Google";
    readonly capabilities: {
        sync: boolean;
        webhook: boolean;
        oauth: boolean;
        basicAuth: boolean;
        apiKey: boolean;
    };
    private readonly logger;
    private readonly defaultScopes;
    getAuthUrl(config: GoogleConfig): string;
    exchangeCode(code: string, config: GoogleConfig): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    connect(config: GoogleConfig & {
        tenantId?: string;
    }, tenantId?: string): Promise<ConnectionResult>;
    listConnections(tenantId: string): Promise<GoogleConnection[]>;
    disconnect(connectionId: string): Promise<void>;
    sync(connectionId: string, _options?: {
        force?: boolean;
        type?: string;
    }): Promise<SyncResult>;
    list(tenantId: string): Promise<ConnectorStatus[]>;
}
