import { IsInt, IsNumber, IsObject, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProduitCommandeDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  commandeId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsObject()
  productSnapshot?: Record<string, unknown>;
}
