import { PartialType } from '@nestjs/mapped-types';
import { CreateProduitVariantDto } from './create-produit-variant.dto';

export class UpdateProduitVariantDto extends PartialType(CreateProduitVariantDto) {}
