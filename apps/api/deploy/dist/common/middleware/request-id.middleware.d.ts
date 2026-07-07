import { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
export declare class RequestIdMiddleware implements NestMiddleware {
    use(request: Request, _response: Response, next: NextFunction): void;
}
