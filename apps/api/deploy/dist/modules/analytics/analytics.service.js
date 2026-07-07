"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(tenantId) {
        const [totalCourses, totalStudents, totalEnrollments, totalSections, totalConnectors, recentEnrollments,] = await Promise.all([
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
    async getCourseStats(tenantId) {
        const courses = await this.prisma.course.findMany({
            where: { tenantId },
            include: {
                _count: { select: { enrollments: true, sections: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const statusBreakdown = courses.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] ?? 0) + 1;
            return acc;
        }, {});
        const totalEnrollments = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
        return {
            totalCourses: courses.length,
            totalEnrollments,
            averageEnrollmentsPerCourse: courses.length > 0
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
    async getEnrollmentTrends(tenantId, days = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const enrollments = await this.prisma.courseEnrollment.findMany({
            where: {
                course: { tenantId },
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true },
        });
        const dailyCounts = new Map();
        for (const e of enrollments) {
            const day = e.createdAt.toISOString().slice(0, 10);
            dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
        }
        const trends = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10);
            trends.unshift({ date, count: dailyCounts.get(date) ?? 0 });
        }
        return {
            period: `${days} days`,
            totalEnrollments: enrollments.length,
            dailyAverage: days > 0
                ? Math.round((enrollments.length / days) * 100) / 100
                : 0,
            trends,
        };
    }
    async getStudentDistribution(tenantId) {
        const courses = await this.prisma.course.findMany({
            where: { tenantId },
            include: {
                _count: { select: { enrollments: true } },
            },
        });
        const distribution = {
            empty: 0,
            low: 0,
            medium: 0,
            high: 0,
            full: 0,
        };
        for (const c of courses) {
            const count = c._count.enrollments;
            if (count === 0)
                distribution.empty++;
            else if (count <= 10)
                distribution.low++;
            else if (count <= 30)
                distribution.medium++;
            else if (count <= 100)
                distribution.high++;
            else
                distribution.full++;
        }
        return { distribution, totalCourses: courses.length };
    }
    async getRevenue(tenantId) {
        const [tenant, allTenants] = await Promise.all([
            this.prisma.tenant.findUnique({
                where: { id: tenantId },
                select: {
                    plan: {
                        select: { name: true, tier: true, price: true, currency: true },
                    },
                    memberships: { select: { id: true } },
                },
            }),
            this.prisma.tenant.count(),
        ]);
        if (!tenant) {
            return {
                planName: 'Free',
                planTier: 'FREE',
                price: 0,
                currency: 'USD',
                userCount: 0,
                estimatedRevenue: 0,
                totalTenants: allTenants,
            };
        }
        const userCount = tenant.memberships.length;
        const price = tenant.plan?.price ?? 0;
        const currency = tenant.plan?.currency ?? 'USD';
        const tier = tenant.plan?.tier ?? 'FREE';
        return {
            planName: tenant.plan?.name ?? 'Free',
            planTier: tier,
            price,
            currency,
            userCount,
            estimatedRevenue: price,
            totalTenants: allTenants,
        };
    }
    async getActivityLog(tenantId, params) {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const where = { tenantId };
        if (params.action)
            where.action = params.action;
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
