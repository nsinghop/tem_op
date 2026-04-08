// ─────────────────────────────────────────────────────────
// Prisma Config — Prisma v7 configuration
// ─────────────────────────────────────────────────────────
// In Prisma v7, database URL is configured here instead
// of in the schema.prisma datasource block.
// ─────────────────────────────────────────────────────────

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
