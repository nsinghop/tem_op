import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { StreamRepository } from './stream.repository';
import { StreamFactory } from './stream.factory';
import { StreamEventEmitter, StreamEventListener } from './stream.observer';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [ChannelModule],
  controllers: [StreamController],
  providers: [
    StreamService,
    StreamRepository,
    StreamFactory,
    StreamEventEmitter,
    StreamEventListener,
  ],
  exports: [StreamService],
})
export class StreamModule {}
