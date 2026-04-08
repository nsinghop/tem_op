// ─────────────────────────────────────────────────────────
// ChannelRepository — DB access layer for Channel model
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { Channel, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class ChannelRepository extends BaseRepository<
  Channel,
  Prisma.ChannelCreateInput,
  Prisma.ChannelUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected get model() {
    return this.prisma.channel;
  }

  /**
   * Find channel by streamKey — used for RTMP auth callback.
   */
  async findByStreamKey(streamKey: string): Promise<Channel | null> {
    return this.prisma.channel.findUnique({ where: { streamKey } });
  }

  /**
   * Find channel with full hierarchy (streams + comments).
   * Used by the Composite pattern to build the tree.
   */
  async findWithHierarchy(channelId: string) {
    return this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        streams: {
          include: {
            comments: {
              include: {
                user: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
