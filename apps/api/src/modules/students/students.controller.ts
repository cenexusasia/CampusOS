import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all students in a tenant' })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('tenantId') tenantId: string,
    @Query() query: { page?: number; perPage?: number; search?: string },
  ) {
    return this.studentsService.findAll(tenantId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new student (add user to tenant)' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body()
    data: {
      tenantId: string;
      email: string;
      name?: string;
      role?: string;
      permissions?: string[];
    },
  ) {
    return this.studentsService.create(data);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get student details by ID' })
  @ApiQuery({ name: 'tenantId', required: true })
  findById(
    @Query('tenantId') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.studentsService.findById(tenantId, userId);
  }

  @Put(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a student (membership role/permissions)' })
  update(
    @Param('userId') userId: string,
    @Body()
    data: {
      tenantId: string;
      role?: string;
      permissions?: string[];
    },
  ) {
    return this.studentsService.update(userId, data);
  }

  @Get(':userId/enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get a student's course enrollments" })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getEnrollments(
    @Query('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Query() query: { page?: number; perPage?: number },
  ) {
    return this.studentsService.getEnrollments(tenantId, userId, query);
  }

  @Get(':userId/grades')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get a student's grades" })
  @ApiQuery({ name: 'tenantId', required: true })
  getGrades(
    @Query('tenantId') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.studentsService.getGrades(tenantId, userId);
  }

  @Get(':userId/sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get a student's section enrollments" })
  @ApiQuery({ name: 'tenantId', required: true })
  getSectionEnrollments(
    @Query('tenantId') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.studentsService.getSectionEnrollments(tenantId, userId);
  }
}
