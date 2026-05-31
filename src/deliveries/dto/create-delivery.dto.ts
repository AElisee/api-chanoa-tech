import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery.entity';

export class CreateDeliveryDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsString()
  tracking_number?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

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
