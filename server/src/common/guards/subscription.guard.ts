// ─────────────────────────────────────────────────────────
// SubscriptionGuard — Enforces subscription-based access
// ─────────────────────────────────────────────────────────
// Checks if user has an active paid subscription.
// Used to gate premium features (unlimited viewing).
// ─────────────────────────────────────────────────────────

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      throw new ForbiddenException('No subscription found');
    }

    if (subscription.plan === 'PAID') {
      if (subscription.expiresAt && subscription.expiresAt < new Date()) {
        throw new ForbiddenException('Subscription has expired');
      }
      return true;
    }

    // FREE users pass the guard but with limited access
    // The Strategy pattern in subscription service handles duration limits
    return true;
  }
}
