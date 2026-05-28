import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProduitCommandeDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  commandeId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
