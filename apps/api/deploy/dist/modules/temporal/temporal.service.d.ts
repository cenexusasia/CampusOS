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
export declare class TemporalService {
    private readonly logger;
    private client;
    onModuleInit(): Promise<void>;
    startWorkflow(options: WorkflowOptions): Promise<WorkflowResult>;
    getWorkflowStatus(workflowId: string): Promise<WorkflowStatus>;
}
