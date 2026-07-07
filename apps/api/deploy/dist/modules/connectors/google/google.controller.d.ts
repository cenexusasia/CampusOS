import { GoogleService } from './google.service';
export declare class GoogleController {
    private readonly googleService;
    constructor(googleService: GoogleService);
    getAuthUrl(tenantId: string): {
        url: string;
    };
    handleCallback(code: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    list(tenantId: string): Promise<import("./google.service").GoogleConnection[]>;
    disconnect(id: string): Promise<void>;
}
