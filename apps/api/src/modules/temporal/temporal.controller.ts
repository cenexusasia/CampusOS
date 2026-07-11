import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TemporalService } from './temporal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Temporal Workflows')
@Controller('temporal')
@UseGuards(JwtAuthGuard)
export class TemporalController {
  constructor(private readonly temporalService: TemporalService) {}

  @Post('workflows')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a Temporal workflow' })
  async startWorkflow(
    @Body() dto: { taskQueue: string; workflowType: string; args: any[]; id: string },
  ) {
    return this.temporalService.startWorkflow(dto);
  }

  @Get('workflows/:id')
  @ApiOperation({ summary: 'Get workflow execution status' })
  async getStatus(@Param('id') id: string) {
    return this.temporalService.getWorkflowStatus(id);
  }
}
