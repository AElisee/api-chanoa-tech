import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProduitPanierDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  panierId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}
