import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import {
  ERROR_CODES,
} from '../../shared';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: any; tokens: TokenPair }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: 'A user with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
        },
      });

      if (dto.tenantName && dto.tenantSlug) {
        const existingTenant = await tx.tenant.findUnique({
          where: { slug: dto.tenantSlug },
        });

        if (existingTenant) {
          throw new ConflictException({
            code: ERROR_CODES.SLUG_ALREADY_EXISTS,
            message: 'A tenant with this slug already exists',
          });
        }

        const plan = await tx.plan.findFirst({
          where: { tier: 'STARTER' },
        });

        const tenant = await tx.tenant.create({
          data: {
            name: dto.tenantName,
            slug: dto.tenantSlug,
            planId: plan?.id,
            status: 'TRIAL',
          },
        });

        await tx.tenantMembership.create({
          data: {
            userId: created.id,
            tenantId: tenant.id,
            role: 'OWNER',
            permissions: [],
          },
        });
      }

      return created;
    });

    const tokens = await this.generateTokens(user.id, user.email, []);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<{ user: any; tokens: TokenPair }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        tenantMemberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const roles = user.tenantMemberships.map((m) => m.role);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          tenantMemberships: {
            include: { tenant: true },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException({
          code: ERROR_CODES.USER_NOT_FOUND,
          message: 'User not found',
        });
      }

      const roles = user.tenantMemberships.map((m) => m.role);
      return this.generateTokens(user.id, user.email, roles);
    } catch {
      throw new UnauthorizedException({
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantMemberships: {
          include: { tenant: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      memberships: user.tenantMemberships.map((m) => ({
        id: m.id,
        role: m.role,
        tenantId: m.tenantId,
        tenant: m.tenant
          ? {
              id: m.tenant.id,
              name: m.tenant.name,
              slug: m.tenant.slug,
              status: m.tenant.status,
            }
          : null,
      })),
      createdAt: user.createdAt,
    };
  }

  async setupMfa(userId: string): Promise<{ secret: string; qrCode: string }> {
    // Placeholder - full MFA to be implemented
    return { secret: 'placeholder', qrCode: 'placeholder' };
  }

  async verifyMfa(userId: string, code: string): Promise<boolean> {
    // Placeholder - full MFA to be implemented
    return code === '123456';
  }

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      expiresIn: '7d',
    } as any);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
