// ─────────────────────────────────────────────────────────
// ChannelController — HTTP endpoints for channels
// ─────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  /**
   * GET /channels/me — Get current user's channel with streamKey.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyChannel(@CurrentUser() user: AuthenticatedUser) {
    const channel = await this.channelService.findByUserId(user.id);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  /**
   * GET /channels/:id — Get channel details (public, no streamKey).
   */
  @Get(':id')
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelService.findById(id);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    // Exclude streamKey from public response
    const { streamKey, ...publicChannel } = channel as any;
    return publicChannel;
  }

  /**
   * GET /channels/:id/hierarchy — Full composite tree.
   */
  @Get(':id/hierarchy')
  async getChannelHierarchy(@Param('id') id: string) {
    const hierarchy = await this.channelService.getChannelHierarchy(id);
    if (!hierarchy) {
      throw new NotFoundException('Channel not found');
    }
    return hierarchy;
  }
}
