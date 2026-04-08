// ─────────────────────────────────────────────────────────
// StreamFactory — FACTORY PATTERN
// ─────────────────────────────────────────────────────────
// Encapsulates the creation of Stream entities.
// Centralizes default values, validation, and creation
// logic so controllers/services don't need to know
// the details of constructing a valid stream object.
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface CreateStreamInput {
  title: string;
  channelId: string;
}

@Injectable()
export class StreamFactory {
  /**
   * Create a standard stream input with proper defaults.
   */
  createStandard(input: CreateStreamInput): Prisma.StreamCreateInput {
    return {
      title: input.title,
      status: 'PENDING',
      channel: { connect: { id: input.channelId } },
    };
  }

  /**
   * Create a stream that starts immediately (Go Live).
   */
  createLive(input: CreateStreamInput): Prisma.StreamCreateInput {
    return {
      title: input.title,
      status: 'LIVE',
      startedAt: new Date(),
      channel: { connect: { id: input.channelId } },
    };
  }

  /**
   * Create a scheduled stream (future use).
   */
  createScheduled(input: CreateStreamInput, scheduledAt: Date): Prisma.StreamCreateInput {
    return {
      title: input.title,
      status: 'PENDING',
      startedAt: scheduledAt,
      channel: { connect: { id: input.channelId } },
    };
  }
}
