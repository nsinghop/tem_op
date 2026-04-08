// ─────────────────────────────────────────────────────────
// Bootstrap — NestJS application entry point
// ─────────────────────────────────────────────────────────

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,            // Auto-transform payloads to DTO instances
    }),
  );

  // CORS — allow frontend dev server
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📡 WebSocket ready on ws://localhost:${port}/chat`);
  logger.log(`🔗 API available at http://localhost:${port}/api`);
}

bootstrap();
