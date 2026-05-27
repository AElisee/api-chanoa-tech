import { PartialType } from '@nestjs/mapped-types';
import { CreateProduitPanierDto } from './create-produit_panier.dto';

export class UpdateProduitPanierDto extends PartialType(CreateProduitPanierDto) {}
