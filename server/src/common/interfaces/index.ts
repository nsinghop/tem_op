// ─────────────────────────────────────────────────────────
// Interfaces — shared type definitions
// ─────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;    // userId
  email: string;
}

// Using a class instead of interface so it can be used
// with decorator metadata (emitDecoratorMetadata requires runtime type)
export class AuthenticatedUser {
  id!: string;
  email!: string;
  name!: string;
}

export interface ViewingResult {
  allowed: boolean;
  maxDurationSeconds: number | null;  // null = unlimited
  message: string;
}
