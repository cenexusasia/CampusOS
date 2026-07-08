import { AgentService } from './agent.service';
declare class ExecuteGoalDto {
    goal: string;
}
export declare class AgentsController {
    private readonly agentService;
    constructor(agentService: AgentService);
    executeGoal(req: any, dto: ExecuteGoalDto): Promise<import("./agent.service").AgentResult>;
}
export {};
