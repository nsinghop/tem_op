// ─────────────────────────────────────────────────────────
// PrismaService — SINGLETON PATTERN
// ─────────────────────────────────────────────────────────
// Wraps PrismaClient as a NestJS injectable singleton.
// Prisma v7 requires a driver adapter for database connections.
// NestJS DI container ensures a single instance is shared
// across all modules that import PrismaModule.
// ─────────────────────────────────────────────────────────

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
