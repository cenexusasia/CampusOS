import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES, type PaginationParams } from '@campusos/shared';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    params: PaginationParams & { search?: string; status?: string },
  ) {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const skip = (page - 1) * perPage;

    // Find users who have memberships in this tenant with student-related roles
    const where: any = {
      tenantMemberships: {
        some: { tenantId },
      },
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          tenantMemberships: {
            where: { tenantId },
            select: { role: true, joinedAt: true },
          },
          _count: {
            select: { courseEnrollments: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: students,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async findById(tenantId: string, userId: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantMemberships: { some: { tenantId } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        tenantMemberships: {
          where: { tenantId },
          select: { role: true, joinedAt: true },
        },
        courseEnrollments: {
          where: { course: { tenantId } },
          include: {
            course: {
              select: { id: true, name: true, code: true, credits: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'Student not found in this tenant',
      });
    }

    return student;
  }

  async getEnrollments(
    tenantId: string,
    userId: string,
    params: PaginationParams,
  ) {
    // Verify student exists in tenant
    await this.findById(tenantId, userId);

    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const where = {
      userId,
      course: { tenantId },
    };

    const [enrollments, total] = await Promise.all([
      this.prisma.courseEnrollment.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              credits: true,
              status: true,
            },
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

  async getGrades(tenantId: string, userId: string) {
    await this.findById(tenantId, userId);

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: {
        userId,
        course: { tenantId },
        grade: { not: null },
      },
      include: {
        course: {
          select: { id: true, name: true, code: true, credits: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalCredits = enrollments.reduce(
      (sum, e) => sum + (e.course.credits ?? 0),
      0,
    );
    const gradedEnrollments = enrollments.filter((e) => e.grade !== null);
    const averageGrade =
      gradedEnrollments.length > 0
        ? gradedEnrollments.reduce((sum, e) => sum + (e.grade ?? 0), 0) /
          gradedEnrollments.length
        : null;

    return {
      enrollments,
      summary: {
        totalCourses: enrollments.length,
        totalCredits,
        averageGrade: averageGrade ? Math.round(averageGrade * 100) / 100 : null,
      },
    };
  }

  async getSectionEnrollments(tenantId: string, userId: string) {
    await this.findById(tenantId, userId);

    return this.prisma.sectionEnrollment.findMany({
      where: {
        userId,
        section: { course: { tenantId } },
      },
      include: {
        section: {
          include: {
            course: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
