import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
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

interface PlannedStep {
  tool: string;
  input: string;
  description: string;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly emailService: EmailService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Execute a goal by breaking it into steps and running each step
   * using the available tools.
   */
  async executeGoal(goal: string, context: AgentContext): Promise<AgentResult> {
    this.logger.log(`Executing goal: "${goal}" for tenant ${context.tenantId}`);

    // Step 1: Plan — use DeepSeek to decide what steps to run
    const steps = await this.planSteps(goal, context);
    if (steps.length === 0) {
      throw new BadRequestException(
        'Could not break goal into executable steps',
      );
    }

    // Step 2: Execute each step sequentially, feeding context forward
    const executedSteps: AgentStep[] = [];
    let accumulatedContext = `Goal: ${goal}\n\n`;

    for (let i = 0; i < steps.length; i++) {
      const planned = steps[i]!;
      const stepLabel = `Step ${i + 1}: ${planned.description}`;
      this.logger.log(`${stepLabel} — tool: ${planned.tool}`);

      const agentStep: AgentStep = {
        step: i + 1,
        tool: planned.tool,
        input: planned.input,
        output: '',
        status: 'success',
      };

      try {
        const result = await this.runTool(
          planned.tool,
          planned.input,
          context,
          accumulatedContext,
        );
        agentStep.output = typeof result === 'string' ? result : JSON.stringify(result);
        accumulatedContext += `${stepLabel}\nInput: ${planned.input}\nOutput: ${agentStep.output}\n\n`;
      } catch (err: any) {
        const errorMsg = err.message ?? String(err);
        this.logger.error(`Step ${i + 1} failed: ${errorMsg}`);
        agentStep.status = 'error';
        agentStep.error = errorMsg;
        agentStep.output = `Error: ${errorMsg}`;
        accumulatedContext += `${stepLabel}\nInput: ${planned.input}\nError: ${errorMsg}\n\n`;
      }

      executedSteps.push(agentStep);
    }

    // Step 3: Produce final summary using DeepSeek
    const finalOutput = await this.summarizeResults(goal, executedSteps, context);

    const successful = executedSteps.filter((s) => s.status === 'success').length;
    const failed = executedSteps.filter((s) => s.status === 'error').length;

    return {
      goal,
      steps: executedSteps,
      finalOutput,
      totalSteps: executedSteps.length,
      successfulSteps: successful,
      failedSteps: failed,
    };
  }

  /**
   * Use DeepSeek to plan which steps to execute for a given goal.
   */
  private async planSteps(
    goal: string,
    context: AgentContext,
  ): Promise<PlannedStep[]> {
    const systemPrompt = `You are an AI agent planner. Given a user's goal and available tools, output a JSON array of steps to execute.

Available tools:
- "searchKnowledgeBase" — Search the institutional knowledge base. Input: a search query string.
- "queryCourses" — Query all courses. Input: a filter/search string (e.g. "computer science" or "all").
- "queryStudents" — Query all students. Input: a filter/search string (e.g. "engineering" or "all").
- "sendNotification" — Send a notification to a user. Input: the notification message text.
- "getAnalytics" — Get analytics/statistics for the tenant. Input: what aspect to analyze (e.g. "overview", "courses", "enrollments").

Rules:
1. Break the goal into 1–5 sequential steps.
2. Each step's output is fed as context to the next step.
3. Use the most specific tool for each sub-task.
4. Output ONLY a valid JSON array — no markdown, no code fences.
5. Each element: { "tool": string, "input": string, "description": string }

Example:
Goal: "Find all courses related to computer science and summarize them"
Response: [
  {"tool":"searchKnowledgeBase","input":"computer science courses","description":"Search knowledge base for computer science information"},
  {"tool":"queryCourses","input":"computer science","description":"Query all computer science courses"},
  {"tool":"sendNotification","input":"Found CS courses — ready for review","description":"Notify user that results are ready"}
]`;

    const userPrompt = `Tenant: ${context.tenantId}
User: ${context.userId}
Goal: ${goal}

Plan the steps as a JSON array.`;

    const response = await this.callDeepSeek(systemPrompt, userPrompt);
    const cleaned = response
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        this.logger.warn('DeepSeek did not return an array, wrapping');
        return [{ tool: parsed.tool, input: parsed.input, description: parsed.description ?? 'Execute step' }];
      }
      return parsed.map((s: any, i: number) => ({
        tool: s.tool,
        input: s.input ?? '',
        description: s.description ?? `Step ${i + 1}`,
      }));
    } catch {
      this.logger.warn(`Failed to parse DeepSeek plan response: ${cleaned}`);
      // Fallback: treat the whole goal as a single knowledge search
      return [
        {
          tool: 'searchKnowledgeBase',
          input: goal,
          description: 'Search knowledge base',
        },
      ];
    }
  }

  /**
   * Execute a single tool call.
   */
  private async runTool(
    tool: string,
    input: string,
    context: AgentContext,
    accumulatedContext: string,
  ): Promise<any> {
    switch (tool) {
      case 'searchKnowledgeBase': {
        return this.searchKnowledgeBase(input, context.tenantId);
      }

      case 'queryCourses': {
        return this.queryCourses(context.tenantId, input);
      }

      case 'queryStudents': {
        return this.queryStudents(context.tenantId, input);
      }

      case 'sendNotification': {
        return this.sendNotification(context.userId, input);
      }

      case 'getAnalytics': {
        return this.getAnalytics(context.tenantId, input);
      }

      default: {
        // Unknown tool — ask DeepSeek to infer from context
        return this.inferFromContext(tool, input, accumulatedContext);
      }
    }
  }

  // ── Tool methods ──────────────────────────────────────────────────────

  async searchKnowledgeBase(query: string, tenantId: string): Promise<any> {
    this.logger.log(`[Agent] searchKnowledgeBase: "${query}"`);
    return this.knowledgeService.search(tenantId, query);
  }

  async queryCourses(tenantId: string, filter?: string): Promise<any> {
    this.logger.log(`[Agent] queryCourses (filter: "${filter ?? 'all'}")`);
    const params: any = { page: 1, perPage: 100 };
    if (filter && filter !== 'all') {
      params.search = filter;
    }
    return this.coursesService.findAll(tenantId, params);
  }

  async queryStudents(tenantId: string, filter?: string): Promise<any> {
    this.logger.log(`[Agent] queryStudents (filter: "${filter ?? 'all'}")`);
    const params: any = { page: 1, perPage: 100 };
    if (filter && filter !== 'all') {
      params.search = filter;
    }
    return this.studentsService.findAll(tenantId, params);
  }

  async sendNotification(userId: string, message: string): Promise<any> {
    this.logger.log(`[Agent] sendNotification to user ${userId}`);
    return this.emailService.send({
      to: userId,
      subject: 'AI Agent Notification',
      body: message,
    });
  }

  async getAnalytics(tenantId: string, aspect?: string): Promise<any> {
    this.logger.log(`[Agent] getAnalytics (aspect: "${aspect ?? 'overview'}")`);
    switch (aspect) {
      case 'courses':
        return this.analyticsService.getCourseStats(tenantId);
      case 'enrollments':
        return this.analyticsService.getEnrollmentTrends(tenantId);
      case 'students':
        return this.analyticsService.getStudentDistribution(tenantId);
      case 'revenue':
        return this.analyticsService.getRevenue(tenantId);
      case 'activity':
        return this.analyticsService.getActivityLog(tenantId, {});
      default:
        return this.analyticsService.getOverview(tenantId);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  /**
   * When a tool name isn't recognized, ask DeepSeek to interpret it from
   * the accumulated execution context.
   */
  private async inferFromContext(
    tool: string,
    input: string,
    context: string,
  ): Promise<string> {
    this.logger.warn(`Unknown tool "${tool}" — asking DeepSeek to infer`);
    const prompt = `The AI agent tried to use tool "${tool}" with input "${input}".

Available context:
${context}

Explain what this step should do using only the available tools:
- searchKnowledgeBase(query)
- queryCourses(tenantId, filter?)
- queryStudents(tenantId, filter?)
- sendNotification(message)
- getAnalytics(tenantId, aspect?)

Respond with a concise explanation of what would be the best tool to use and why.`;
    return this.callDeepSeek('You are an AI agent debugger.', prompt);
  }

  /**
   * Produce a final summary by feeding all step results to DeepSeek.
   */
  private async summarizeResults(
    goal: string,
    steps: AgentStep[],
    context: AgentContext,
  ): Promise<string> {
    const stepsSummary = steps
      .map(
        (s) =>
          `Step ${s.step} [${s.status}] — ${s.tool}\nInput: ${s.input}\nOutput: ${s.output}`,
      )
      .join('\n\n');

    const systemPrompt = `You are an AI agent that summarizes execution results.
Given the user's original goal and the results of each step, produce a clear, concise summary of:
1. What was accomplished
2. Key findings or results
3. Any errors encountered
Keep the summary under 500 words.`;

    const userPrompt = `Goal: ${goal}

Steps executed:
${stepsSummary}

Tenant: ${context.tenantId}
User: ${context.userId}

Please summarize what happened.`;

    return this.callDeepSeek(systemPrompt, userPrompt);
  }

  /**
   * Call DeepSeek Chat API directly.
   */
  private async callDeepSeek(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY not set — returning static fallback');
      return this.staticFallback(systemPrompt, userPrompt);
    }

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errBody}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  /**
   * Fallback when DEEPSEEK_API_KEY is not configured.
   */
  private async staticFallback(
    _systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    // Try to extract a basic plan from the user prompt
    if (userPrompt.toLowerCase().includes('plan')) {
      const goalMatch = userPrompt.match(/Goal:\s*([\s\S]*?)(?:\n\n|$)/);
      const goal = goalMatch && goalMatch[1] ? goalMatch[1].trim().slice(0, 200) : 'Execute goal';
      return JSON.stringify([
        {
          tool: 'searchKnowledgeBase',
          input: goal,
          description: 'Search knowledge base',
        },
        {
          tool: 'queryCourses',
          input: 'all',
          description: 'Query all courses',
        },
      ]);
    }
    return 'DeepSeek API key not configured. Please set DEEPSEEK_API_KEY in your environment.';
  }
}
