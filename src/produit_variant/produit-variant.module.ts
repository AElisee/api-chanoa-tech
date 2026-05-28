import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitVariant } from './entities/produit-variant.entity';
import { ProduitVariantService } from './produit-variant.service';
import { ProduitVariantController } from './produit-variant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProduitVariant])],
  controllers: [ProduitVariantController],
  providers: [ProduitVariantService],
  exports: [ProduitVariantService],
})
export class ProduitVariantModule {}
