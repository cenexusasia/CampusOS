import { TemporalService } from './temporal.service';
export declare class TemporalController {
    private readonly temporalService;
    constructor(temporalService: TemporalService);
    startWorkflow(dto: {
        taskQueue: string;
        workflowType: string;
        args: any[];
        id: string;
    }): Promise<import("./temporal.service").WorkflowResult>;
    getStatus(id: string): Promise<import("./temporal.service").WorkflowStatus>;
}
