// =============================================================================
// Temporal Workflow Definitions — CampusOS Connector Sync
// =============================================================================
// These are workflow function definitions to be executed by a Temporal Worker.
// Temporal workers process these asynchronously with built-in retries,
// timeouts, and state persistence.
//
// Actual worker implementation to be added when Temporal is running.
// Until then, these serve as the contract and are testable via BullMQ fallback.
// =============================================================================

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

/**
 * connectorSyncWorkflow — multi-step connector data sync
 *
 * Steps (to be expanded with real implementations):
 * 1. Fetch data from the external provider (Moodle, ERPNext, OpenSIS, etc.)
 * 2. Transform/normalize data to CampusOS schema
 * 3. Upsert records to CampusOS database
 * 4. Send completion notification
 *
 * This function is the Temporal workflow definition.
 * When Temporal is unavailable, callers fall back to BullMQ.
 */
export async function connectorSyncWorkflow(
  input: SyncWorkflowInput,
): Promise<SyncWorkflowResult> {
  const startTime = Date.now();
  console.log(
    `[Temporal] Starting sync workflow for ${input.provider} connector ${input.connectorId} (tenant: ${input.tenantId})`,
  );

  // --- Step 1: Validate input ---
  if (!input.connectorId || !input.tenantId || !input.provider) {
    return {
      success: false,
      itemsSynced: 0,
      error: 'Missing required fields: connectorId, tenantId, provider',
      durationMs: Date.now() - startTime,
    };
  }

  // --- Step 2: Fetch external data ---
  // TODO: Implement provider-specific data fetching
  // e.g., await moodleService.fetchCourses(input.connectorId);

  // --- Step 3: Transform and upsert ---
  // TODO: Transform fetched data and upsert to CampusOS DB

  // --- Step 4: Send notification ---
  // TODO: Notify tenant admin about sync completion

  console.log(`[Temporal] Sync completed for ${input.provider} / ${input.connectorId}`);

  return {
    success: true,
    itemsSynced: 0,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Schedule a periodic sync for a connector.
 * Called by Temporal cron schedules or scheduled workflow executions.
 */
export async function scheduledConnectorSync(
  input: SyncWorkflowInput,
): Promise<SyncWorkflowResult> {
  console.log(
    `[Temporal] Scheduled sync triggered for ${input.provider} / ${input.connectorId}`,
  );
  return connectorSyncWorkflow(input);
}
