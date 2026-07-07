import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(tenantId: string, query: {
        page?: number;
        perPage?: number;
        search?: string;
    }): Promise<{
        data: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            createdAt: Date;
            tenantMemberships: {
                role: string;
                joinedAt: Date;
            }[];
            _count: {
                courseEnrollments: number;
            };
        }[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(data: {
        tenantId: string;
        email: string;
        name?: string;
        role?: string;
        permissions?: string[];
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
        };
    } & {
        id: string;
        userId: string;
        tenantId: string;
        role: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        joinedAt: Date;
    }>;
    findById(tenantId: string, userId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        createdAt: Date;
        courseEnrollments: ({
            course: {
                id: string;
                name: string;
                code: string;
                credits: number | null;
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
        tenantMemberships: {
            role: string;
            joinedAt: Date;
        }[];
    }>;
    update(userId: string, data: {
        tenantId: string;
        role?: string;
        permissions?: string[];
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
        };
    } & {
        id: string;
        userId: string;
        tenantId: string;
        role: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        joinedAt: Date;
    }>;
    getEnrollments(tenantId: string, userId: string, query: {
        page?: number;
        perPage?: number;
    }): Promise<{
        data: ({
            course: {
                status: string;
                id: string;
                name: string;
                code: string;
                credits: number | null;
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
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    getGrades(tenantId: string, userId: string): Promise<{
        enrollments: ({
            course: {
                id: string;
                name: string;
                code: string;
                credits: number | null;
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
        summary: {
            totalCourses: number;
            totalCredits: number;
            averageGrade: number | null;
        };
    }>;
    getSectionEnrollments(tenantId: string, userId: string): Promise<({
        section: {
            course: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            schedule: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            capacity: number;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sectionId: string;
    })[]>;
}
