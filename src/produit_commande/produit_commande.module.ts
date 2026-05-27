import { Module } from '@nestjs/common';
import { ProduitCommandeService } from './produit_commande.service';
import { ProduitCommandeController } from './produit_commande.controller';

@Module({
  controllers: [ProduitCommandeController],
  providers: [ProduitCommandeService],
})
export class ProduitCommandeModule {}
