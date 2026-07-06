import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    request.headers['x-request-id'] = requestId;

    _response.setHeader('X-Request-Id', requestId);

    next();
  }
}
