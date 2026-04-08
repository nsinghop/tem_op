// ─────────────────────────────────────────────────────────
// AuthModule — Feature module for authentication
// ─────────────────────────────────────────────────────────

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { ChannelModule } from '../channel/channel.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    UserModule,
    ChannelModule,
    SubscriptionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
