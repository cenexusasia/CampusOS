import { Injectable, Logger } from '@nestjs/common';

export interface WorkflowOptions {
  taskQueue: string;
  workflowType: string;
  args: any[];
  id: string;
}

export interface WorkflowResult {
  workflowId: string | null;
  fallback?: boolean;
  error?: string;
}

export interface WorkflowStatus {
  workflowId: string;
  status: string;
  result?: any;
  error?: string;
}

@Injectable()
export class TemporalService {
  private readonly logger = new Logger(TemporalService.name);
  private client: any = null;

  async onModuleInit(): Promise<void> {
    try {
      // Dynamic import so Temporal dependency is optional at runtime
// @ts-ignore — optional dependency, guarded by try/catch at runtime
      const { Client } = await import('@temporalio/client');
      this.client = new Client({
        connection: {
          address: process.env.TEMPORAL_HOST || 'localhost:7233',
        },
      });
      this.logger.log('Temporal client connected successfully');
    } catch {
      this.logger.warn(
        'Temporal server not available — workflows will fall back to BullMQ if Redis is available',
      );
    }
  }

  /**
   * Start a Temporal workflow. Falls back gracefully when Temporal is unavailable.
   */
  async startWorkflow(options: WorkflowOptions): Promise<WorkflowResult> {
    if (!this.client) {
      this.logger.warn(
        `[Temporal] Fallback: workflow "${options.workflowType}" would queue via BullMQ`,
      );
      return { workflowId: null, fallback: true };
    }

    try {
      const handle = await this.client.workflow.start(options.workflowType, {
        args: options.args,
        taskQueue: options.taskQueue,
        workflowId: options.id,
      });
      this.logger.log(`Workflow started: ${handle.workflowId}`);
      return { workflowId: handle.workflowId };
    } catch (err: any) {
      this.logger.error(`Temporal start failed: ${err.message}`);
      return { workflowId: null, fallback: true, error: err.message };
    }
  }

  /**
   * Get the status of a running or completed workflow.
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    if (!this.client) {
      return { workflowId, status: 'UNAVAILABLE' };
    }

    try {
      const handle = this.client.workflow.getHandle(workflowId);
      const describe = await handle.describe();
      return {
        workflowId,
        status: describe.status?.name ?? 'UNKNOWN',
        result: describe.result
          ? JSON.parse(JSON.stringify(describe.result))
          : undefined,
      };
    } catch (err: any) {
      this.logger.error(`Failed to get workflow status: ${err.message}`);
      return { workflowId, status: 'ERROR', error: err.message };
    }
  }
}
