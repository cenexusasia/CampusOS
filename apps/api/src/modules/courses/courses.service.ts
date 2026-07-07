import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES, type PaginationParams } from '@campusos/shared';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tenantId: string;
    name: string;
    code: string;
    description?: string;
    credits?: number;
    syllabus?: any;
    status?: string;
  }) {
    const existing = await this.prisma.course.findUnique({
      where: { tenantId_code: { tenantId: data.tenantId, code: data.code } },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.CONFLICT,
        message: `A course with code "${data.code}" already exists in this tenant`,
      });
    }

    const course = await this.prisma.course.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        code: data.code,
        description: data.description,
        credits: data.credits,
        syllabus: data.syllabus ?? undefined,
        status: data.status ?? 'DRAFT',
      },
      include: {
        sections: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });

    this.logger.log(`Course created: ${course.code} (${course.id})`);
    return course;
  }

  async findAll(
    tenantId: string,
    params: PaginationParams & { status?: string; search?: string },
  ) {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          sections: { select: { id: true, name: true, capacity: true } },
          tags: { include: { tag: true } },
          _count: { select: { enrollments: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
        tags: { include: { tag: true } },
        enrollments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Course not found',
      });
    }

    return course;
  }

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      credits?: number;
      syllabus?: any;
      status?: string;
    },
  ) {
    await this.findById(id);

    const course = await this.prisma.course.update({
      where: { id },
      data: data as any,
      include: {
        sections: true,
        _count: { select: { enrollments: true } },
      },
    });

    return course;
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.course.delete({
      where: { id },
    });

    this.logger.log(`Course deleted: ${id}`);
    return { success: true, message: 'Course deleted' };
  }

  async getEnrollments(
    courseId: string,
    params: PaginationParams & { status?: string },
  ) {
    await this.findById(courseId);

    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const where: any = { courseId };
    if (params.status) where.status = params.status;

    const [enrollments, total] = await Promise.all([
      this.prisma.courseEnrollment.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      this.prisma.courseEnrollment.count({ where }),
    ]);

    return {
      data: enrollments,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async enrollStudent(courseId: string, userId: string) {
    await this.findById(courseId);

    const existing = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.CONFLICT,
        message: 'Student is already enrolled in this course',
      });
    }

    const enrollment = await this.prisma.courseEnrollment.create({
      data: { courseId, userId, status: 'ENROLLED' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    this.logger.log(`Student ${userId} enrolled in course ${courseId}`);
    return enrollment;
  }

  async updateEnrollment(
    courseId: string,
    userId: string,
    data: { status?: string; grade?: number },
  ) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (!enrollment) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Enrollment not found',
      });
    }

    return this.prisma.courseEnrollment.update({
      where: { courseId_userId: { courseId, userId } },
      data: data as any,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async removeEnrollment(courseId: string, userId: string) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (!enrollment) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Enrollment not found',
      });
    }

    await this.prisma.courseEnrollment.delete({
      where: { courseId_userId: { courseId, userId } },
    });

    return { success: true, message: 'Student unenrolled' };
  }

  async getSections(courseId: string) {
    await this.findById(courseId);

    return this.prisma.section.findMany({
      where: { courseId },
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createSection(
    courseId: string,
    data: { name: string; capacity?: number; schedule?: any },
  ) {
    await this.findById(courseId);

    const section = await this.prisma.section.create({
      data: {
        courseId,
        name: data.name,
        capacity: data.capacity ?? 30,
        schedule: data.schedule ?? undefined,
      },
    });

    return section;
  }
}
