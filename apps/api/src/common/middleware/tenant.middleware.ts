import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@campusos/shared';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;

    if (!tenantId) {
      // Attach empty tenant context - some routes don't require tenant
      (req as any).tenantId = null;
      (req as any).tenant = null;
      next();
      return;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException({
        code: ERROR_CODES.TENANT_NOT_FOUND,
        message: `Tenant with ID "${tenantId}" not found`,
      });
    }

    if (tenant.status === 'SUSPENDED') {
      throw new BadRequestException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Tenant is suspended',
      });
    }

    (req as any).tenantId = tenant.id;
    (req as any).tenant = tenant;
    next();
  }
}
