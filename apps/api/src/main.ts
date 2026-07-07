import { NestFactory } from '@nestjs/core';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CampusOS API')
    .setDescription('AI Operating System for Educational Institutions')
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT token' }, 'access-token')
    .addApiKey({ type: 'apiKey', name: 'X-Tenant-Id', in: 'header', description: 'Tenant identifier' }, 'tenant-id')
    .addTag('Health', 'Health check endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Tenants', 'Tenant management')
    .addTag('Courses', 'Course management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha', operationsSorter: 'alpha' },
    customSiteTitle: 'CampusOS API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });
}

export async function createNestApp(expressInstance?: express.Express) {
  const adapter = expressInstance ? new ExpressAdapter(expressInstance) : undefined;
  const app = await NestFactory.create(AppModule, adapter as any);

  const configService = app.get(ConfigService);
  const globalPrefix = configService.get<string>('API_GLOBAL_PREFIX', 'api/v1');

  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
  });
  app.use(compression());
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true }, validateCustomDecorators: true }),
  );
  setupSwagger(app);
  await app.init();

  if (expressInstance) {
    return expressInstance;
  }
  const appInstance = app as any;
  return appInstance;
}

// Standalone server mode (local development, Railway, Render)
async function bootstrap() {
  const app = await createNestApp();
  const configService = app.get(ConfigService);
  const port = configService.get('API_PORT', 3001);
  await app.listen(port);
  console.log(`\n🚀 CampusOS API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
}

// Vercel serverless mode — export handler
import type { Request, Response } from 'express';
let cachedHandler: express.Express;

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    const expressApp = express();
    cachedHandler = await createNestApp(expressApp);
  }
  cachedHandler(req, res);
}

// Only start server when run directly (not on Vercel)
if (!process.env['VERCEL']) {
  void bootstrap();
}
