import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new course' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body()
    data: {
      tenantId: string;
      name: string;
      code: string;
      description?: string;
      credits?: number;
      syllabus?: any;
      status?: string;
    },
  ) {
    return this.coursesService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List courses' })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('tenantId') tenantId: string,
    @Query()
    query: {
      page?: number;
      perPage?: number;
      status?: string;
      search?: string;
    },
  ) {
    return this.coursesService.findAll(tenantId, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get course by ID' })
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a course' })
  update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      code?: string;
      description?: string;
      credits?: number;
      syllabus?: any;
      status?: string;
    },
  ) {
    return this.coursesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':id/enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get course enrollments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'status', required: false })
  getEnrollments(
    @Param('id') id: string,
    @Query() query: { page?: number; perPage?: number; status?: string },
  ) {
    return this.coursesService.getEnrollments(id, query);
  }

  @Post(':id/enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Enroll a student in a course' })
  @HttpCode(HttpStatus.CREATED)
  enrollStudent(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.coursesService.enrollStudent(id, userId);
  }

  @Put(':id/enrollments/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update enrollment status/grade' })
  updateEnrollment(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() data: { status?: string; grade?: number },
  ) {
    return this.coursesService.updateEnrollment(id, userId, data);
  }

  @Delete(':id/enrollments/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove enrollment (unenroll student)' })
  removeEnrollment(@Param('id') id: string, @Param('userId') userId: string) {
    return this.coursesService.removeEnrollment(id, userId);
  }

  @Get(':id/sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get course sections' })
  getSections(@Param('id') id: string) {
    return this.coursesService.getSections(id);
  }

  @Post(':id/sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a course section' })
  @HttpCode(HttpStatus.CREATED)
  createSection(
    @Param('id') id: string,
    @Body() data: { name: string; capacity?: number; schedule?: any },
  ) {
    return this.coursesService.createSection(id, data);
  }
}
