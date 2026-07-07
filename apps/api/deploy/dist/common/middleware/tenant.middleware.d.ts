import { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
export declare class TenantMiddleware implements NestMiddleware {
    private readonly prisma;
    constructor(prisma: PrismaService);
    use(req: Request, _res: Response, next: NextFunction): Promise<void>;
}
