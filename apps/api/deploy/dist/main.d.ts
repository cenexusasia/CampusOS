import { type INestApplication } from '@nestjs/common';
import express from 'express';
export declare function setupSwagger(app: INestApplication): void;
export declare function createNestApp(expressInstance?: express.Express): Promise<any>;
import type { Request, Response } from 'express';
export default function handler(req: Request, res: Response): Promise<void>;
