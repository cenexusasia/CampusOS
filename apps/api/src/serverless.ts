import { createServer } from 'http';
import { parse } from 'url';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: express.Express;

async function bootstrapApp() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );

  app.enableCors({
    origin: process.env['NEXT_PUBLIC_APP_URL'] || '*',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return expressApp;
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await bootstrapApp();
  }
  const url = parse(req.url, true);
  // Vercel routes /api/v1/* -> /api/v1/* so keep as-is
  return new Promise<void>((resolve, reject) => {
    cachedApp(req, res, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Also start a local server if running standalone (not on Vercel)
if (!process.env['VERCEL']) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const port = process.env['API_PORT'] || 4000;
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
  }
  bootstrap();
}
