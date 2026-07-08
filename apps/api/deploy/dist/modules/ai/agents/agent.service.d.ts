import { KnowledgeService } from '../../knowledge/knowledge.service';
import { CoursesService } from '../../courses/courses.service';
import { StudentsService } from '../../students/students.service';
import { EmailService } from '../../notifications/email.service';
import { AnalyticsService } from '../../analytics/analytics.service';
export interface AgentStep {
    step: number;
    tool: string;
    input: string;
    output: string;
    status: 'success' | 'error';
    error?: string;
}
export interface AgentResult {
    goal: string;
    steps: AgentStep[];
    finalOutput: string;
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
}
export interface AgentContext {
    tenantId: string;
    userId: string;
}
export declare class AgentService {
    private readonly knowledgeService;
    private readonly coursesService;
    private readonly studentsService;
    private readonly emailService;
    private readonly analyticsService;
    private readonly logger;
    constructor(knowledgeService: KnowledgeService, coursesService: CoursesService, studentsService: StudentsService, emailService: EmailService, analyticsService: AnalyticsService);
    executeGoal(goal: string, context: AgentContext): Promise<AgentResult>;
    private planSteps;
    private runTool;
    searchKnowledgeBase(query: string, tenantId: string): Promise<any>;
    queryCourses(tenantId: string, filter?: string): Promise<any>;
    queryStudents(tenantId: string, filter?: string): Promise<any>;
    sendNotification(userId: string, message: string): Promise<any>;
    getAnalytics(tenantId: string, aspect?: string): Promise<any>;
    private inferFromContext;
    private summarizeResults;
    private callDeepSeek;
    private staticFallback;
}
