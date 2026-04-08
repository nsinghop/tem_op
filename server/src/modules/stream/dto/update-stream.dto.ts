// ─────────────────────────────────────────────────────────
// Update Stream DTO
// ─────────────────────────────────────────────────────────

import { IsString, IsOptional } from 'class-validator';

export class UpdateStreamDto {
  @IsString()
  @IsOptional()
  title?: string;
}
