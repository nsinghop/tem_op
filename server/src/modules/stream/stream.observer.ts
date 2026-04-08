// ─────────────────────────────────────────────────────────
// StreamObserver — OBSERVER PATTERN
// ─────────────────────────────────────────────────────────
// Uses NestJS EventEmitter to implement the Observer pattern.
// Stream lifecycle events (started, ended) are emitted and
// can be subscribed to by any module (chat, notifications).
//
// Architecture decision: Using event-driven approach decouples
// the stream module from downstream consumers. Adding new
// subscribers (e.g., analytics, email notifications) requires
// zero changes to the stream module.
// ─────────────────────────────────────────────────────────

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

// ── Event definitions ──

export class StreamStartedEvent {
  constructor(
    public readonly streamId: string,
    public readonly channelId: string,
    public readonly title: string,
  ) {}
}

export class StreamEndedEvent {
  constructor(
    public readonly streamId: string,
    public readonly channelId: string,
  ) {}
}

// ── Event constants ──
export const STREAM_EVENTS = {
  STARTED: 'stream.started',
  ENDED: 'stream.ended',
} as const;

// ── Event emitter service ──

@Injectable()
export class StreamEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitStreamStarted(streamId: string, channelId: string, title: string): void {
    this.eventEmitter.emit(
      STREAM_EVENTS.STARTED,
      new StreamStartedEvent(streamId, channelId, title),
    );
  }

  emitStreamEnded(streamId: string, channelId: string): void {
    this.eventEmitter.emit(
      STREAM_EVENTS.ENDED,
      new StreamEndedEvent(streamId, channelId),
    );
  }
}

// ── Event listener (subscriber) ──

@Injectable()
export class StreamEventListener {
  private readonly logger = new Logger(StreamEventListener.name);

  @OnEvent(STREAM_EVENTS.STARTED)
  handleStreamStarted(event: StreamStartedEvent): void {
    this.logger.log(
      `🔴 Stream LIVE: "${event.title}" (stream: ${event.streamId}, channel: ${event.channelId})`,
    );
  }

  @OnEvent(STREAM_EVENTS.ENDED)
  handleStreamEnded(event: StreamEndedEvent): void {
    this.logger.log(
      `⚫ Stream ENDED: (stream: ${event.streamId}, channel: ${event.channelId})`,
    );
  }
}
