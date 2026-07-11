export interface SyncWorkflowInput {
    connectorId: string;
    tenantId: string;
    provider: string;
}
export interface SyncWorkflowResult {
    success: boolean;
    itemsSynced: number;
    error?: string;
    durationMs?: number;
}
export declare function connectorSyncWorkflow(input: SyncWorkflowInput): Promise<SyncWorkflowResult>;
export declare function scheduledConnectorSync(input: SyncWorkflowInput): Promise<SyncWorkflowResult>;
