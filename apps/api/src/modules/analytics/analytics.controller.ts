import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get tenant analytics overview' })
  @ApiQuery({ name: 'tenantId', required: true })
  getOverview(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getOverview(tenantId);
  }

  @Get('courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get course-level statistics' })
  @ApiQuery({ name: 'tenantId', required: true })
  getCourseStats(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getCourseStats(tenantId);
  }

  @Get('enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get enrollment trends over time' })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'days', required: false })
  getEnrollmentTrends(
    @Query('tenantId') tenantId: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getEnrollmentTrends(tenantId, days ?? 30);
  }

  @Get('distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get student distribution across courses' })
  @ApiQuery({ name: 'tenantId', required: true })
  getStudentDistribution(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getStudentDistribution(tenantId);
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get audit/activity logs' })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'action', required: false })
  getActivityLog(
    @Query('tenantId') tenantId: string,
    @Query() query: { page?: number; perPage?: number; action?: string },
  ) {
    return this.analyticsService.getActivityLog(tenantId, query);
  }
}
