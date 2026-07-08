import { ERPNextService, type ERPNextConfig } from './erpnext.service';
export declare class ERPNextController {
    private readonly erpnextService;
    constructor(erpnextService: ERPNextService);
    connect(config: ERPNextConfig, tenantId: string): Promise<import("../connector.interface").ConnectionResult>;
    list(tenantId: string): Promise<import("./erpnext.service").ERPNextConnection[]>;
    sync(id: string): Promise<import("../connector.interface").SyncResult>;
    disconnect(id: string): Promise<void>;
}
