import { OpenSISService, type OpenSISConfig } from './opensis.service';
export declare class OpenSISController {
    private readonly openSISService;
    constructor(openSISService: OpenSISService);
    connect(config: OpenSISConfig, tenantId: string): Promise<{
        success: boolean;
        connectionId: string;
        validatedBy?: string;
    }>;
    list(tenantId: string): Promise<import("./opensis.service").OpenSISConnection[]>;
    sync(id: string): Promise<{
        studentsSynced: number;
        staffSynced: number;
        coursesSynced: number;
    }>;
    disconnect(id: string): Promise<void>;
}
