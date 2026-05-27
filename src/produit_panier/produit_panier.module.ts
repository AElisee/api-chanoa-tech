import { Module } from '@nestjs/common';
import { ProduitPanierService } from './produit_panier.service';
import { ProduitPanierController } from './produit_panier.controller';

@Module({
  controllers: [ProduitPanierController],
  providers: [ProduitPanierService],
})
export class ProduitPanierModule {}
