import { PartialType } from '@nestjs/mapped-types';
import { CreateProduitCommandeDto } from './create-produit_commande.dto';

export class UpdateProduitCommandeDto extends PartialType(CreateProduitCommandeDto) {}
