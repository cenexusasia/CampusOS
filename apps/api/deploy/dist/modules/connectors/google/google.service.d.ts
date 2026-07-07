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
export declare class GoogleService {
    private readonly logger;
    private readonly defaultScopes;
    getAuthUrl(config: GoogleConfig): string;
    exchangeCode(code: string, config: GoogleConfig): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    listConnections(tenantId: string): Promise<GoogleConnection[]>;
    disconnect(connectionId: string): Promise<void>;
}
