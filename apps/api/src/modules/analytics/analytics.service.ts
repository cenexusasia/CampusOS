import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    const [
      totalCourses,
      totalStudents,
      totalEnrollments,
      totalSections,
      totalConnectors,
      recentEnrollments,
    ] = await Promise.all([
      this.prisma.course.count({ where: { tenantId } }),
      this.prisma.tenantMembership.count({ where: { tenantId } }),
      this.prisma.courseEnrollment.count({
        where: { course: { tenantId } },
      }),
      this.prisma.section.count({
        where: { course: { tenantId } },
      }),
      this.prisma.connector.count({ where: { tenantId } }),
      this.prisma.courseEnrollment.findMany({
        where: { course: { tenantId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return {
      summary: {
        totalCourses,
        totalStudents,
        totalEnrollments,
        totalSections,
        totalConnectors,
      },
      recentEnrollments,
    };
  }

  async getCourseStats(tenantId: string) {
    const courses = await this.prisma.course.findMany({
      where: { tenantId },
      include: {
        _count: { select: { enrollments: true, sections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const statusBreakdown = courses.reduce(
      (acc, c) => {
        acc[c.status] = (acc[c.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalEnrollments = courses.reduce(
      (sum, c) => sum + c._count.enrollments,
      0,
    );

    return {
      totalCourses: courses.length,
      totalEnrollments,
      averageEnrollmentsPerCourse:
        courses.length > 0
          ? Math.round((totalEnrollments / courses.length) * 100) / 100
          : 0,
      statusBreakdown,
      courses: courses.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        status: c.status,
        enrollments: c._count.enrollments,
        sections: c._count.sections,
        createdAt: c.createdAt,
      })),
    };
  }

  async getEnrollmentTrends(tenantId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: {
        course: { tenantId },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    // Group by day
    const dailyCounts = new Map<string, number>();
    for (const e of enrollments) {
      const day = e.createdAt.toISOString().slice(0, 10);
      dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
    }

    // Fill in all days in range
    const trends: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      trends.unshift({ date, count: dailyCounts.get(date) ?? 0 });
    }

    return {
      period: `${days} days`,
      totalEnrollments: enrollments.length,
      dailyAverage:
        days > 0
          ? Math.round((enrollments.length / days) * 100) / 100
          : 0,
      trends,
    };
  }

  async getStudentDistribution(tenantId: string) {
    const courses = await this.prisma.course.findMany({
      where: { tenantId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    // Enrollment distribution buckets
    const distribution = {
      empty: 0, // 0 enrollments
      low: 0, // 1-10
      medium: 0, // 11-30
      high: 0, // 31-100
      full: 0, // 100+
    };

    for (const c of courses) {
      const count = c._count.enrollments;
      if (count === 0) distribution.empty++;
      else if (count <= 10) distribution.low++;
      else if (count <= 30) distribution.medium++;
      else if (count <= 100) distribution.high++;
      else distribution.full++;
    }

    return { distribution, totalCourses: courses.length };
  }

  async getActivityLog(
    tenantId: string,
    params: { page?: number; perPage?: number; action?: string },
  ) {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const where: any = { tenantId };
    if (params.action) where.action = params.action;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }
}
