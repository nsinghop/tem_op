// ─────────────────────────────────────────────────────────
// AuthService — Registration & Login business logic
// ─────────────────────────────────────────────────────────

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly subscriptionService: SubscriptionService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user with auto-created channel and free subscription.
   * Architecture: Orchestrates UserService, ChannelService, SubscriptionService
   * following the Single Responsibility Principle.
   */
  async register(dto: RegisterDto) {
    // Check for existing user
    const existingUser = await this.userService.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check for existing channel name
    const existingChannel = await this.channelService.findOne({ name: dto.channelName });
    if (existingChannel) {
      throw new ConflictException('Channel name already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, AuthService.SALT_ROUNDS);

    // Create user
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    // Create channel (auto-generates streamKey via Prisma default)
    const channel = await this.channelService.create({
      name: dto.channelName,
      user: { connect: { id: user.id } },
    });

    // Create free subscription
    await this.subscriptionService.create({
      user: { connect: { id: user.id } },
      plan: 'FREE',
    });

    // Generate JWT
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      channel: {
        id: channel.id,
        name: channel.name,
        streamKey: channel.streamKey,
      },
      accessToken: token,
    };
  }

  /**
   * Authenticate user with email/password and return JWT.
   */
  async login(dto: LoginDto) {
    const user = await this.userService.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: token,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
