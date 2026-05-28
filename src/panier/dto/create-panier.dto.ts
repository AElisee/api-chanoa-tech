import { IsOptional, IsUUID } from 'class-validator';

export class CreatePanierDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
