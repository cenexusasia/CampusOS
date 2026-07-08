import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockCourse = {
  id: 'course-1',
  tenantId: 'tenant-1',
  name: 'Introduction to AI',
  code: 'CS101',
  description: 'Fundamentals of artificial intelligence',
  credits: 3,
  syllabus: null,
  status: 'DRAFT',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  sections: [],
  _count: { enrollments: 0 },
  tags: [],
};

const mockEnrollment = {
  id: 'enroll-1',
  courseId: 'course-1',
  userId: 'user-1',
  status: 'ENROLLED',
  grade: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  user: { id: 'user-1', name: 'Student', email: 'student@test.edu' },
};

const mockSection = {
  id: 'section-1',
  courseId: 'course-1',
  name: 'Section A',
  capacity: 30,
  schedule: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  _count: { enrollments: 0 },
};

const mockPrisma = {
  course: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  courseEnrollment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  section: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get(PrismaService);
  });

  // -----------------------------------------------------------------------
  // create
  // -----------------------------------------------------------------------
  describe('create', () => {
    const createData = {
      tenantId: 'tenant-1',
      name: 'Introduction to AI',
      code: 'CS101',
      description: 'Fundamentals of artificial intelligence',
      credits: 3,
    };

    it('should create a new course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      prisma.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(createData);

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { tenantId_code: { tenantId: 'tenant-1', code: 'CS101' } },
      });
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          name: 'Introduction to AI',
          code: 'CS101',
          status: 'DRAFT',
        }),
        include: { sections: true, _count: { select: { enrollments: true } } },
      });
      expect(result).toEqual(mockCourse);
    });

    it('should throw ConflictException when course code already exists in tenant', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);

      await expect(service.create(createData)).rejects.toThrow(
        new ConflictException({
          code: ERROR_CODES.CONFLICT,
          message: 'A course with code "CS101" already exists in this tenant',
        }),
      );

      expect(prisma.course.create).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // findAll
  // -----------------------------------------------------------------------
  describe('findAll', () => {
    it('should return paginated courses for a tenant', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', { page: 1, perPage: 20 });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          sections: { select: { id: true, name: true, capacity: true } },
          tags: { include: { tag: true } },
          _count: { select: { enrollments: true } },
        },
      });
      expect(result).toEqual({
        data: [mockCourse],
        meta: { page: 1, perPage: 20, total: 1, totalPages: 1 },
      });
    });

    it('should filter by status when provided', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);
      prisma.course.count.mockResolvedValue(1);

      await service.findAll('tenant-1', { status: 'PUBLISHED' });

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });

    it('should search by name or code', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);
      prisma.course.count.mockResolvedValue(1);

      await service.findAll('tenant-1', { search: 'AI' });

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'AI', mode: 'insensitive' } },
              { code: { contains: 'AI', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // findById
  // -----------------------------------------------------------------------
  describe('findById', () => {
    it('should return course with full relations', async () => {
      const fullCourse = {
        ...mockCourse,
        sections: [mockSection],
        tags: [],
        enrollments: [mockEnrollment],
        _count: { enrollments: 1 },
      };
      prisma.course.findUnique.mockResolvedValue(fullCourse);

      const result = await service.findById('course-1');

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        include: {
          sections: { include: { _count: { select: { enrollments: true } } } },
          tags: { include: { tag: true } },
          enrollments: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            take: 50,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { enrollments: true } },
        },
      });
      expect(result).toEqual(fullCourse);
    });

    it('should throw NotFoundException for non-existent course', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: 'Course not found',
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // update
  // -----------------------------------------------------------------------
  describe('update', () => {
    it('should update course fields', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.course.update.mockResolvedValue({ ...mockCourse, name: 'Advanced AI' });

      const result = await service.update('course-1', { name: 'Advanced AI' });

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        include: {
          sections: { include: { _count: { select: { enrollments: true } } } },
          tags: { include: { tag: true } },
          enrollments: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            take: 50,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { enrollments: true } },
        },
      });
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        data: { name: 'Advanced AI' },
        include: { sections: true, _count: { select: { enrollments: true } } },
      });
      expect(result.name).toBe('Advanced AI');
    });
  });

  // -----------------------------------------------------------------------
  // remove
  // -----------------------------------------------------------------------
  describe('remove', () => {
    it('should delete a course', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.course.delete.mockResolvedValue(mockCourse);

      const result = await service.remove('course-1');

      expect(prisma.course.delete).toHaveBeenCalledWith({
        where: { id: 'course-1' },
      });
      expect(result).toEqual({ success: true, message: 'Course deleted' });
    });
  });

  // -----------------------------------------------------------------------
  // Enrollment methods
  // -----------------------------------------------------------------------
  describe('getEnrollments', () => {
    it('should return paginated enrollments', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.courseEnrollment.findMany.mockResolvedValue([mockEnrollment]);
      prisma.courseEnrollment.count.mockResolvedValue(1);

      const result = await service.getEnrollments('course-1', { page: 1, perPage: 20 });

      expect(prisma.courseEnrollment.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('enrollStudent', () => {
    it('should enroll a student in a course', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.courseEnrollment.findUnique.mockResolvedValue(null);
      prisma.courseEnrollment.create.mockResolvedValue(mockEnrollment);

      const result = await service.enrollStudent('course-1', 'user-1');

      expect(prisma.courseEnrollment.create).toHaveBeenCalledWith({
        data: { courseId: 'course-1', userId: 'user-1', status: 'ENROLLED' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw ConflictException for duplicate enrollment', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.courseEnrollment.findUnique.mockResolvedValue(mockEnrollment);

      await expect(
        service.enrollStudent('course-1', 'user-1'),
      ).rejects.toThrow(
        new ConflictException({
          code: ERROR_CODES.CONFLICT,
          message: 'Student is already enrolled in this course',
        }),
      );
    });
  });

  describe('updateEnrollment', () => {
    it('should update enrollment status/grade', async () => {
      prisma.courseEnrollment.findUnique.mockResolvedValue(mockEnrollment);
      prisma.courseEnrollment.update.mockResolvedValue({
        ...mockEnrollment,
        status: 'COMPLETED',
        grade: 95,
      });

      const result = await service.updateEnrollment('course-1', 'user-1', {
        status: 'COMPLETED',
        grade: 95,
      });

      expect(prisma.courseEnrollment.update).toHaveBeenCalledWith({
        where: { courseId_userId: { courseId: 'course-1', userId: 'user-1' } },
        data: { status: 'COMPLETED', grade: 95 },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(result.status).toBe('COMPLETED');
      expect(result.grade).toBe(95);
    });

    it('should throw NotFoundException for non-existent enrollment', async () => {
      prisma.courseEnrollment.findUnique.mockResolvedValue(null);

      await expect(
        service.updateEnrollment('course-1', 'nonexistent', { status: 'COMPLETED' }),
      ).rejects.toThrow(
        new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: 'Enrollment not found',
        }),
      );
    });
  });

  describe('removeEnrollment', () => {
    it('should remove an enrollment', async () => {
      prisma.courseEnrollment.findUnique.mockResolvedValue(mockEnrollment);
      prisma.courseEnrollment.delete.mockResolvedValue(mockEnrollment);

      const result = await service.removeEnrollment('course-1', 'user-1');

      expect(prisma.courseEnrollment.delete).toHaveBeenCalledWith({
        where: { courseId_userId: { courseId: 'course-1', userId: 'user-1' } },
      });
      expect(result).toEqual({ success: true, message: 'Student unenrolled' });
    });
  });

  // -----------------------------------------------------------------------
  // Section methods
  // -----------------------------------------------------------------------
  describe('getSections', () => {
    it('should return sections for a course', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.section.findMany.mockResolvedValue([mockSection]);

      const result = await service.getSections('course-1');

      expect(prisma.section.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockSection]);
    });
  });

  describe('createSection', () => {
    it('should create a section', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.section.create.mockResolvedValue(mockSection);

      const result = await service.createSection('course-1', { name: 'Section A' });

      expect(prisma.section.create).toHaveBeenCalledWith({
        data: { courseId: 'course-1', name: 'Section A', capacity: 30, schedule: undefined },
      });
      expect(result).toEqual(mockSection);
    });
  });
});
