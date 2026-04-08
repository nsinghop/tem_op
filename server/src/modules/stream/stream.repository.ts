// ─────────────────────────────────────────────────────────
// StreamRepository — DB access layer for Stream model
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { Stream, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class StreamRepository extends BaseRepository<
  Stream,
  Prisma.StreamCreateInput,
  Prisma.StreamUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected get model() {
    return this.prisma.stream;
  }

  /**
   * Get all currently live streams with channel info.
   */
  async findLiveStreams(): Promise<any[]> {
    return this.prisma.stream.findMany({
      where: { status: 'LIVE' },
      include: {
        channel: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Get streams for a specific channel.
   */
  async findByChannelId(channelId: string): Promise<Stream[]> {
    return this.prisma.stream.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get stream with channel and comments.
   */
  async findWithDetails(streamId: string) {
    return this.prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        channel: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });
  }
}
