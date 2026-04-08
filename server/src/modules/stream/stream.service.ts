// ─────────────────────────────────────────────────────────
// StreamService — Business logic for Stream operations
// ─────────────────────────────────────────────────────────

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Stream, Prisma } from '@prisma/client';
import { StreamRepository } from './stream.repository';
import { StreamFactory, CreateStreamInput } from './stream.factory';
import { StreamEventEmitter } from './stream.observer';
import { ChannelService } from '../channel/channel.service';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class StreamService extends BaseService<
  Stream,
  Prisma.StreamCreateInput,
  Prisma.StreamUpdateInput
> {
  private readonly logger = new Logger(StreamService.name);

  constructor(
    private readonly streamRepository: StreamRepository,
    private readonly streamFactory: StreamFactory,
    private readonly streamEventEmitter: StreamEventEmitter,
    private readonly channelService: ChannelService,
  ) {
    super(streamRepository);
  }

  /**
   * Create a new stream for a user's channel.
   * Uses Factory pattern for stream creation.
   */
  async createStream(userId: string, title: string): Promise<Stream> {
    const channel = await this.channelService.findByUserId(userId);
    if (!channel) {
      throw new NotFoundException('Channel not found for this user');
    }

    const input: CreateStreamInput = { title, channelId: channel.id };
    const data = this.streamFactory.createStandard(input);

    return this.repository.create(data);
  }

  /**
   * Start a stream (Go Live).
   * Emits stream.started event via Observer pattern.
   */
  async startStream(streamId: string, userId: string): Promise<Stream> {
    const stream = await this.streamRepository.findById(streamId);
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    // Verify ownership
    const channel = await this.channelService.findByUserId(userId);
    if (!channel || stream.channelId !== channel.id) {
      throw new ForbiddenException('You do not own this stream');
    }

    const updatedStream = await this.repository.update(streamId, {
      status: 'LIVE',
      startedAt: new Date(),
    });

    // Observer: emit stream started event
    this.streamEventEmitter.emitStreamStarted(
      streamId,
      stream.channelId,
      stream.title,
    );

    return updatedStream;
  }

  /**
   * Stop a stream (End).
   * Emits stream.ended event via Observer pattern.
   */
  async stopStream(streamId: string, userId: string): Promise<Stream> {
    const stream = await this.streamRepository.findById(streamId);
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    const channel = await this.channelService.findByUserId(userId);
    if (!channel || stream.channelId !== channel.id) {
      throw new ForbiddenException('You do not own this stream');
    }

    const updatedStream = await this.repository.update(streamId, {
      status: 'ENDED',
      endedAt: new Date(),
    });

    // Observer: emit stream ended event
    this.streamEventEmitter.emitStreamEnded(streamId, stream.channelId);

    return updatedStream;
  }

  /**
   * Get all live streams (public).
   */
  async getLiveStreams() {
    return this.streamRepository.findLiveStreams();
  }

  /**
   * Get streams by channel.
   */
  async getStreamsByChannel(channelId: string) {
    return this.streamRepository.findByChannelId(channelId);
  }

  /**
   * Get stream with full details.
   */
  async getStreamDetails(streamId: string) {
    const stream = await this.streamRepository.findWithDetails(streamId);
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }
    return stream;
  }
}
