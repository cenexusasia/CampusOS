"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorSyncWorkflow = connectorSyncWorkflow;
exports.scheduledConnectorSync = scheduledConnectorSync;
async function connectorSyncWorkflow(input) {
    const startTime = Date.now();
    console.log(`[Temporal] Starting sync workflow for ${input.provider} connector ${input.connectorId} (tenant: ${input.tenantId})`);
    if (!input.connectorId || !input.tenantId || !input.provider) {
        return {
            success: false,
            itemsSynced: 0,
            error: 'Missing required fields: connectorId, tenantId, provider',
            durationMs: Date.now() - startTime,
        };
    }
    console.log(`[Temporal] Sync completed for ${input.provider} / ${input.connectorId}`);
    return {
        success: true,
        itemsSynced: 0,
        durationMs: Date.now() - startTime,
    };
}
async function scheduledConnectorSync(input) {
    console.log(`[Temporal] Scheduled sync triggered for ${input.provider} / ${input.connectorId}`);
    return connectorSyncWorkflow(input);
}
