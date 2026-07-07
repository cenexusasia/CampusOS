import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES, type PaginationParams } from '@campusos/shared';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tenantId: string;
    email: string;
    name?: string;
    role?: string;
    permissions?: string[];
  }) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: `No user found with email: ${data.email}`,
      });
    }

    // Check if user is already a member of this tenant
    const existing = await this.prisma.tenantMembership.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId: data.tenantId } },
    });

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.CONFLICT,
        message: 'User is already a member of this tenant',
      });
    }

    const membership = await this.prisma.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: data.tenantId,
        role: data.role ?? 'MEMBER',
        permissions: data.permissions ?? [],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    this.logger.log(`Student created: ${user.email} in tenant ${data.tenantId}`);
    return membership;
  }

  async update(
    userId: string,
    data: { tenantId: string; role?: string; permissions?: string[] },
  ) {
    const membership = await this.prisma.tenantMembership.findUnique({
      where: { userId_tenantId: { userId, tenantId: data.tenantId } },
    });

    if (!membership) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Student membership not found in this tenant',
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.role !== undefined) updateData.role = data.role;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;

    const updated = await this.prisma.tenantMembership.update({
      where: { userId_tenantId: { userId, tenantId: data.tenantId } },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    this.logger.log(`Student updated: ${userId} in tenant ${data.tenantId}`);
    return updated;
  }

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
