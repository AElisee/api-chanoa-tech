import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @IsOptional()
  @IsString()
  tracking_number?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  shipped_at?: string;

  @IsOptional()
  @IsDateString()
  delivered_at?: string;
}
