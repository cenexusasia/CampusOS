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
var StudentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_1 = require("../../shared");
let StudentsService = StudentsService_1 = class StudentsService {
    prisma;
    logger = new common_1.Logger(StudentsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.USER_NOT_FOUND,
                message: `No user found with email: ${data.email}`,
            });
        }
        const existing = await this.prisma.tenantMembership.findUnique({
            where: { userId_tenantId: { userId: user.id, tenantId: data.tenantId } },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: shared_1.ERROR_CODES.CONFLICT,
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
    async update(userId, data) {
        const membership = await this.prisma.tenantMembership.findUnique({
            where: { userId_tenantId: { userId, tenantId: data.tenantId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.NOT_FOUND,
                message: 'Student membership not found in this tenant',
            });
        }
        const updateData = {};
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.permissions !== undefined)
            updateData.permissions = data.permissions;
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
    async findAll(tenantId, params) {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const where = {
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
    async findById(tenantId, userId) {
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
            throw new common_1.NotFoundException({
                code: shared_1.ERROR_CODES.USER_NOT_FOUND,
                message: 'Student not found in this tenant',
            });
        }
        return student;
    }
    async getEnrollments(tenantId, userId, params) {
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
    async getGrades(tenantId, userId) {
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
        const totalCredits = enrollments.reduce((sum, e) => sum + (e.course.credits ?? 0), 0);
        const gradedEnrollments = enrollments.filter((e) => e.grade !== null);
        const averageGrade = gradedEnrollments.length > 0
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
    async getSectionEnrollments(tenantId, userId) {
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
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = StudentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
