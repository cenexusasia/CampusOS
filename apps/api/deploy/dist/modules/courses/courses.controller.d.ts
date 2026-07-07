import { CoursesService } from './courses.service';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(data: {
        tenantId: string;
        name: string;
        code: string;
        description?: string;
        credits?: number;
        syllabus?: any;
        status?: string;
    }): Promise<{
        _count: {
            enrollments: number;
        };
        sections: {
            schedule: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            capacity: number;
        }[];
    } & {
        description: string | null;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        credits: number | null;
        syllabus: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(tenantId: string, query: {
        page?: number;
        perPage?: number;
        status?: string;
        search?: string;
    }): Promise<{
        data: ({
            tags: ({
                tag: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    tenantId: string;
                    color: string | null;
                };
            } & {
                courseId: string;
                tagId: string;
            })[];
            _count: {
                enrollments: number;
            };
            sections: {
                id: string;
                name: string;
                capacity: number;
            }[];
        } & {
            description: string | null;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            code: string;
            credits: number | null;
            syllabus: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                tenantId: string;
                color: string | null;
            };
        } & {
            courseId: string;
            tagId: string;
        })[];
        _count: {
            enrollments: number;
        };
        enrollments: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                image: string | null;
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
        sections: ({
            _count: {
                enrollments: number;
            };
        } & {
            schedule: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            capacity: number;
        })[];
    } & {
        description: string | null;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        credits: number | null;
        syllabus: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, data: {
        name?: string;
        code?: string;
        description?: string;
        credits?: number;
        syllabus?: any;
        status?: string;
    }): Promise<{
        _count: {
            enrollments: number;
        };
        sections: {
            schedule: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            capacity: number;
        }[];
    } & {
        description: string | null;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        code: string;
        credits: number | null;
        syllabus: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getEnrollments(id: string, query: {
        page?: number;
        perPage?: number;
        status?: string;
    }): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                image: string | null;
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
    enrollStudent(id: string, userId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        grade: number | null;
        courseId: string;
    }>;
    updateEnrollment(id: string, userId: string, data: {
        status?: string;
        grade?: number;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        grade: number | null;
        courseId: string;
    }>;
    removeEnrollment(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSections(id: string): Promise<({
        _count: {
            enrollments: number;
        };
    } & {
        schedule: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        capacity: number;
    })[]>;
    createSection(id: string, data: {
        name: string;
        capacity?: number;
        schedule?: any;
    }): Promise<{
        schedule: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        capacity: number;
    }>;
}
