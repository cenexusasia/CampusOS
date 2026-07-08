export interface ConnectorPlugin {
    provider: string;
    name: string;
    capabilities: {
        sync: boolean;
        webhook: boolean;
        oauth: boolean;
        basicAuth: boolean;
        apiKey: boolean;
    };
    connect(config: ConnectorConfig): Promise<ConnectionResult>;
    sync(connectionId: string, options?: SyncOptions): Promise<SyncResult>;
    disconnect(connectionId: string): Promise<void>;
    list(tenantId: string): Promise<ConnectorStatus[]>;
}
export interface ConnectorConfig {
    [key: string]: any;
}
export interface ConnectionResult {
    success: boolean;
    connectionId: string;
    siteInfo?: unknown;
}
export interface SyncOptions {
    force?: boolean;
    type?: 'courses' | 'users' | 'all';
}
export interface SyncResult {
    success: boolean;
    coursesSynced?: number;
    usersSynced?: number;
    studentsSynced?: number;
    staffSynced?: number;
    error?: string;
}
export interface ConnectorStatus {
    id: string;
    provider: string;
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSyncAt: Date | null;
    config: Record<string, any>;
}
