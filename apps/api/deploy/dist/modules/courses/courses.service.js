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
var CoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("@campusos/shared");
let CoursesService = CoursesService_1 = class CoursesService {
    prisma;
    logger = new common_1.Logger(CoursesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existing = await this.prisma.course.findUnique({
            where: { tenantId_code: { tenantId: data.tenantId, code: data.code } },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: shared_1.ERROR_CODES.CONFLICT,
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
    async findAll(tenantId, params) {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const where = { tenantId };
        if (params.status)
            where.status = params.status;
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
    async findById(id) {
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
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Course not found',
            });
        }
        return course;
    }
    async update(id, data) {
        await this.findById(id);
        const course = await this.prisma.course.update({
            where: { id },
            data: data,
            include: {
                sections: true,
                _count: { select: { enrollments: true } },
            },
        });
        return course;
    }
    async remove(id) {
        await this.findById(id);
        await this.prisma.course.delete({
            where: { id },
        });
        this.logger.log(`Course deleted: ${id}`);
        return { success: true, message: 'Course deleted' };
    }
    async getEnrollments(courseId, params) {
        await this.findById(courseId);
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const where = { courseId };
        if (params.status)
            where.status = params.status;
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
    async enrollStudent(courseId, userId) {
        await this.findById(courseId);
        const existing = await this.prisma.courseEnrollment.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: shared_1.ERROR_CODES.CONFLICT,
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
    async updateEnrollment(courseId, userId, data) {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Enrollment not found',
            });
        }
        return this.prisma.courseEnrollment.update({
            where: { courseId_userId: { courseId, userId } },
            data: data,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async removeEnrollment(courseId, userId) {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Enrollment not found',
            });
        }
        await this.prisma.courseEnrollment.delete({
            where: { courseId_userId: { courseId, userId } },
        });
        return { success: true, message: 'Student unenrolled' };
    }
    async getSections(courseId) {
        await this.findById(courseId);
        return this.prisma.section.findMany({
            where: { courseId },
            include: {
                _count: { select: { enrollments: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createSection(courseId, data) {
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
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = CoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
