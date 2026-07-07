import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOverview(tenantId: string): Promise<{
        summary: {
            totalCourses: number;
            totalStudents: number;
            totalEnrollments: number;
            totalSections: number;
            totalConnectors: number;
        };
        recentEnrollments: ({
            user: {
                id: string;
                email: string;
                name: string | null;
            };
            course: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            status: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            grade: number | null;
            courseId: string;
        })[];
    }>;
    getCourseStats(tenantId: string): Promise<{
        totalCourses: number;
        totalEnrollments: number;
        averageEnrollmentsPerCourse: number;
        statusBreakdown: Record<string, number>;
        courses: {
            id: string;
            name: string;
            code: string;
            status: string;
            enrollments: number;
            sections: number;
            createdAt: Date;
        }[];
    }>;
    getEnrollmentTrends(tenantId: string, days?: number): Promise<{
        period: string;
        totalEnrollments: number;
        dailyAverage: number;
        trends: {
            date: string;
            count: number;
        }[];
    }>;
    getStudentDistribution(tenantId: string): Promise<{
        distribution: {
            empty: number;
            low: number;
            medium: number;
            high: number;
            full: number;
        };
        totalCourses: number;
    }>;
    getRevenue(tenantId: string): Promise<{
        planName: string;
        planTier: string;
        price: number;
        currency: string;
        userCount: number;
        estimatedRevenue: number;
        totalTenants: number;
    }>;
    getActivityLog(tenantId: string, params: {
        page?: number;
        perPage?: number;
        action?: string;
    }): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            tenantId: string | null;
            action: string;
            resource: string;
            resourceId: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
}
