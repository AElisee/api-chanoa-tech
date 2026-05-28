import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProduitPanierDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  panierId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
