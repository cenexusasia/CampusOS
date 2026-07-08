import { Throttle } from '@nestjs/throttler';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

class ExecuteGoalDto {
  goal!: string;
}

@ApiTags('AI Agents')
@Controller('api/v1/agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Throttle({ default: { ttl: 60000, limit: 20 } })
export class AgentsController {
  constructor(private readonly agentService: AgentService) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute a goal-driven multi-step AI agent task',
    description:
      'Breaks a natural-language goal into steps, executes each step using available tools (knowledge search, courses, students, notifications, analytics), and returns step-by-step results with a final summary.',
  })
  async executeGoal(
    @Request() req: any,
    @Body() dto: ExecuteGoalDto,
  ) {
    if (!dto.goal || dto.goal.trim().length === 0) {
      throw new BadRequestException('Goal is required');
    }

    const tenantId = req.tenantId ?? req.user?.tenantId;
    const userId = req.user?.sub ?? req.user?.id;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    return this.agentService.executeGoal(dto.goal, {
      tenantId,
      userId,
    });
  }
}
