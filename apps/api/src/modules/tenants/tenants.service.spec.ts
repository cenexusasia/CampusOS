import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockTenant = {
  id: 'tenant-1',
  name: 'Test University',
  slug: 'test-university',
  domain: 'test.edu',
  logo: null,
  planId: 'plan-1',
  status: 'TRIAL',
  settings: {
    branding: { primaryColor: '#2563eb', logo: null },
    locale: 'en-US',
    timezone: 'UTC',
    features: { aiAssistant: true, analytics: true, connectors: false, customBranding: false },
  },
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  _count: { memberships: 3, courses: 10, departments: 5, connectors: 2 },
  plan: { id: 'plan-1', name: 'Starter', tier: 'STARTER', price: 0 },
};

const mockMembership = {
  id: 'mem-1',
  userId: 'user-1',
  tenantId: 'tenant-1',
  role: 'OWNER',
  permissions: [],
  joinedAt: new Date('2025-01-01T00:00:00Z'),
  user: { id: 'user-1', email: 'admin@test.edu', name: 'Admin', image: null, createdAt: new Date('2025-01-01T00:00:00Z') },
};

const mockVerificationToken = {
  identifier: 'tenant-1:user@test.edu',
  token: 'invite-token-abc',
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  type: 'invitation',
};

const mockPrisma = {
  tenant: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  tenantMembership: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  verificationToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    prisma = module.get(PrismaService);
  });

  // -----------------------------------------------------------------------
  // create
  // -----------------------------------------------------------------------
  describe('create', () => {
    const createDto = { name: 'Test University', slug: 'test-university', domain: 'test.edu' };

    it('should create a new tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue(mockTenant);

      const result = await service.create(createDto);

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-university' },
      });
      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test University',
          slug: 'test-university',
          domain: 'test.edu',
          status: 'TRIAL',
          settings: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw ConflictException when slug already exists', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException({
          code: ERROR_CODES.SLUG_ALREADY_EXISTS,
          message: 'A tenant with this slug already exists',
        }),
      );

      expect(prisma.tenant.create).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // findAll
  // -----------------------------------------------------------------------
  describe('findAll', () => {
    it('should return paginated tenants', async () => {
      prisma.tenant.findMany.mockResolvedValue([mockTenant]);
      prisma.tenant.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, perPage: 20 });

      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { memberships: true } }, plan: true },
      });
      expect(result).toEqual({
        data: [mockTenant],
        meta: { page: 1, perPage: 20, total: 1, totalPages: 1 },
      });
    });

    it('should use default pagination when no params provided', async () => {
      prisma.tenant.findMany.mockResolvedValue([]);
      prisma.tenant.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { memberships: true } }, plan: true },
      });
      expect(result.meta.page).toBe(1);
      expect(result.meta.perPage).toBe(20);
    });
  });

  // -----------------------------------------------------------------------
  // findById
  // -----------------------------------------------------------------------
  describe('findById', () => {
    it('should return tenant details', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.findById('tenant-1');

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        include: {
          plan: true,
          _count: { select: { memberships: true, courses: true, departments: true, connectors: true } },
        },
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException for non-existent tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        new NotFoundException({
          code: ERROR_CODES.TENANT_NOT_FOUND,
          message: 'Tenant not found',
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // update
  // -----------------------------------------------------------------------
  describe('update', () => {
    it('should update tenant fields', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.tenant.update.mockResolvedValue({ ...mockTenant, name: 'Updated University' });

      const result = await service.update('tenant-1', { name: 'Updated University' });

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        include: {
          plan: true,
          _count: { select: { memberships: true, courses: true, departments: true, connectors: true } },
        },
      });
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { name: 'Updated University' },
      });
      expect(result.name).toBe('Updated University');
    });
  });

  // -----------------------------------------------------------------------
  // remove
  // -----------------------------------------------------------------------
  describe('remove', () => {
    it('should soft-delete (mark as DELETED)', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.tenant.update.mockResolvedValue({ ...mockTenant, status: 'DELETED' });

      const result = await service.remove('tenant-1');

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { status: 'DELETED' },
      });
      expect(result).toEqual({ success: true, message: 'Tenant marked as deleted' });
    });
  });

  // -----------------------------------------------------------------------
  // inviteUser / acceptInvitation
  // -----------------------------------------------------------------------
  describe('inviteUser', () => {
    it('should create an invitation token', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.verificationToken.create.mockResolvedValue(mockVerificationToken);

      const result = await service.inviteUser('tenant-1', { email: 'user@test.edu', role: 'MEMBER' });

      expect(prisma.verificationToken.create).toHaveBeenCalledWith({
        data: {
          identifier: 'tenant-1:user@test.edu',
          token: expect.any(String),
          expires: expect.any(Date),
          type: 'invitation',
        },
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('user@test.edu');
      expect(result.token).toBeDefined();
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation and create membership', async () => {
      prisma.verificationToken.findUnique.mockResolvedValue(mockVerificationToken);
      prisma.tenantMembership.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockResolvedValue([{ id: 'mem-new' }, {}]);

      const result = await service.acceptInvitation('invite-token-abc', 'user-2');

      expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'invite-token-abc' },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully joined tenant');
    });

    it('should throw for expired token', async () => {
      prisma.verificationToken.findUnique.mockResolvedValue({
        ...mockVerificationToken,
        expires: new Date('2020-01-01'),
      });

      await expect(
        service.acceptInvitation('expired-token', 'user-2'),
      ).rejects.toThrow(
        new NotFoundException({
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Invalid or expired invitation token',
        }),
      );
    });

    it('should return already a member when membership exists', async () => {
      prisma.verificationToken.findUnique.mockResolvedValue(mockVerificationToken);
      prisma.tenantMembership.findUnique.mockResolvedValue(mockMembership);

      const result = await service.acceptInvitation('invite-token-abc', 'user-1');

      expect(result).toEqual({ success: true, message: 'Already a member of this tenant' });
    });
  });

  // -----------------------------------------------------------------------
  // suspendTenant / activateTenant
  // -----------------------------------------------------------------------
  describe('suspendTenant', () => {
    it('should suspend a tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.tenant.update.mockResolvedValue({ ...mockTenant, status: 'SUSPENDED' });

      const result = await service.suspendTenant('tenant-1');

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { status: 'SUSPENDED' },
      });
      expect(result).toEqual({ success: true, message: 'Tenant suspended' });
    });
  });

  describe('activateTenant', () => {
    it('should activate a tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.tenant.update.mockResolvedValue({ ...mockTenant, status: 'ACTIVE' });

      const result = await service.activateTenant('tenant-1');

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { status: 'ACTIVE' },
      });
      expect(result).toEqual({ success: true, message: 'Tenant activated' });
    });
  });

  // -----------------------------------------------------------------------
  // getMembers
  // -----------------------------------------------------------------------
  describe('getMembers', () => {
    it('should return paginated members', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.tenantMembership.findMany.mockResolvedValue([mockMembership]);
      prisma.tenantMembership.count.mockResolvedValue(1);

      const result = await service.getMembers('tenant-1', { page: 1, perPage: 20 });

      expect(prisma.tenantMembership.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        skip: 0,
        take: 20,
        include: {
          user: { select: { id: true, email: true, name: true, image: true, createdAt: true } },
        },
        orderBy: { joinedAt: 'desc' },
      });
      expect(result.data).toEqual([mockMembership]);
      expect(result.meta.total).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // updateMemberRole
  // -----------------------------------------------------------------------
  describe('updateMemberRole', () => {
    it('should update member role', async () => {
      prisma.tenantMembership.findFirst.mockResolvedValue(mockMembership);
      prisma.tenantMembership.update.mockResolvedValue({ ...mockMembership, role: 'ADMIN' });

      const result = await service.updateMemberRole('tenant-1', 'mem-1', 'ADMIN');

      expect(prisma.tenantMembership.findFirst).toHaveBeenCalledWith({
        where: { id: 'mem-1', tenantId: 'tenant-1' },
      });
      expect(prisma.tenantMembership.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { role: 'ADMIN' },
      });
      expect(result.role).toBe('ADMIN');
    });

    it('should throw NotFoundException for non-existent membership', async () => {
      prisma.tenantMembership.findFirst.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('tenant-1', 'nonexistent', 'ADMIN'),
      ).rejects.toThrow(
        new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: 'Membership not found',
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // removeMember
  // -----------------------------------------------------------------------
  describe('removeMember', () => {
    it('should remove a member', async () => {
      prisma.tenantMembership.findFirst.mockResolvedValue(mockMembership);
      prisma.tenantMembership.delete.mockResolvedValue(mockMembership);

      const result = await service.removeMember('tenant-1', 'mem-1');

      expect(prisma.tenantMembership.delete).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
      });
      expect(result).toEqual({ success: true, message: 'Member removed' });
    });
  });
});
