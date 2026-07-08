import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ERROR_CODES } from '@campusos/shared';

// Mock bcryptjs at module level — cannot vi.spyOn ESM namespace exports
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const mockUserId = 'user-abc-123';
const mockEmail = 'jane@campusos.dev';
const mockName = 'Jane Doe';
const mockPassword = 'SecurePass123!';
const mockPasswordHash = '$2a$12$abcdefghijklmnopqrstuvwxyzABCDEF1234567890';
const mockAccessToken = 'eyJhbGciOiJIUzI1NiJ9.access';
const mockRefreshToken = 'eyJhbGciOiJIUzI1NiJ9.refresh';

const mockUser = {
  id: mockUserId,
  email: mockEmail,
  name: mockName,
  passwordHash: mockPasswordHash,
  image: null,
  emailVerified: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
};

const mockUserWithMemberships = {
  ...mockUser,
  tenantMemberships: [
    {
      id: 'mem-1',
      role: 'OWNER',
      tenantId: 'tenant-1',
      tenant: {
        id: 'tenant-1',
        name: 'Test Tenant',
        slug: 'test-tenant',
        status: 'TRIAL',
      },
    },
  ],
};

const mockPlan = {
  id: 'plan-1',
  tier: 'STARTER',
  name: 'Starter',
};

const mockTenant = {
  id: 'tenant-1',
  name: 'Test Tenant',
  slug: 'test-tenant',
  status: 'TRIAL',
  planId: 'plan-1',
};

const mockMembership = {
  id: 'mem-1',
  userId: mockUserId,
  tenantId: 'tenant-1',
  role: 'OWNER',
  permissions: [],
};

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockTx = {
  user: {
    create: vi.fn().mockResolvedValue(mockUser),
  },
  tenant: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(mockTenant),
  },
  plan: {
    findFirst: vi.fn().mockResolvedValue(mockPlan),
  },
  tenantMembership: {
    create: vi.fn().mockResolvedValue(mockMembership),
  },
};

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn().mockImplementation(async (cb: (tx: any) => any) => cb(mockTx)),
};

const mockJwt = {
  sign: vi.fn(),
  verify: vi.fn(),
};

const mockConfig = {
  get: vi.fn((key: string, defaultValue?: string) => {
    const values: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_EXPIRES_IN: '15m',
    };
    return values[key] ?? defaultValue;
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrisma;
  let jwt: typeof mockJwt;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
  });

  // -----------------------------------------------------------------------
  // register
  // -----------------------------------------------------------------------
  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockJwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.register({
        email: mockEmail,
        password: mockPassword,
        name: mockName,
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 12);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalledWith({
        data: {
          email: mockEmail,
          name: mockName,
          passwordHash: mockPasswordHash,
        },
      });
      expect(mockJwt.sign).toHaveBeenCalledTimes(2);
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      });
      expect(result.tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 900,
      });
    });

    it('should create a tenant and membership when tenantName and tenantSlug provided', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockJwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.register({
        email: mockEmail,
        password: mockPassword,
        name: mockName,
        tenantName: 'Test Tenant',
        tenantSlug: 'test-tenant',
      });

      expect(mockTx.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-tenant' },
      });
      expect(mockTx.plan.findFirst).toHaveBeenCalledWith({
        where: { tier: 'STARTER' },
      });
      expect(mockTx.tenant.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Tenant',
          slug: 'test-tenant',
          planId: 'plan-1',
          status: 'TRIAL',
        },
      });
      expect(mockTx.tenantMembership.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          tenantId: 'tenant-1',
          role: 'OWNER',
          permissions: [],
        },
      });
      expect(result.user.id).toBe(mockUserId);
    });

    it('should reject duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: mockEmail,
          password: mockPassword,
          name: mockName,
        }),
      ).rejects.toThrow(
        new ConflictException({
          code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: 'A user with this email already exists',
        }),
      );

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // login
  // -----------------------------------------------------------------------
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithMemberships);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockJwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.login({
        email: mockEmail,
        password: mockPassword,
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: {
          tenantMemberships: {
            include: { tenant: true },
          },
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockPasswordHash);
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
      });
      expect(result.tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 900,
      });
    });

    it('should reject invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithMemberships);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({
          email: mockEmail,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(
        new UnauthorizedException({
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        }),
      );
    });

    it('should reject non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@campusos.dev',
          password: mockPassword,
        }),
      ).rejects.toThrow(
        new UnauthorizedException({
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // refresh
  // -----------------------------------------------------------------------
  describe('refresh', () => {
    it('should return new tokens for a valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({
        sub: mockUserId,
        email: mockEmail,
        roles: ['OWNER'],
      });
      prisma.user.findUnique.mockResolvedValue(mockUserWithMemberships);
      mockJwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.refresh('valid-refresh-token');

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          tenantMemberships: {
            include: { tenant: true },
          },
        },
      });
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 900,
      });
    });

    it('should reject an expired / invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('expired-refresh-token')).rejects.toThrow(
        new UnauthorizedException({
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Invalid or expired refresh token',
        }),
      );
    });

    it('should reject when the user no longer exists', async () => {
      // The service wraps the entire refresh body in try/catch, so any error
      // (including the "user not found" UnauthorizedException from the inner
      // check) is caught and re-thrown as TOKEN_EXPIRED.
      mockJwt.verify.mockReturnValue({
        sub: 'deleted-user-id',
        email: 'gone@campusos.dev',
        roles: [],
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('token-for-deleted-user')).rejects.toThrow(
        new UnauthorizedException({
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Invalid or expired refresh token',
        }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // logout
  // -----------------------------------------------------------------------
  describe('logout', () => {
    it('should return a success message for a known user', async () => {
      const result = await service.logout(mockUserId);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
