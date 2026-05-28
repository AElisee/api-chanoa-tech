import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitPanierService } from './produit_panier.service';
import { ProduitPanierController } from './produit_panier.controller';
import { ProduitPanier } from './entities/produit_panier.entity';
import { Produit } from '../produits/entities/produit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProduitPanier, Produit])],
  controllers: [ProduitPanierController],
  providers: [ProduitPanierService],
  exports: [ProduitPanierService],
})
export class ProduitPanierModule {}
