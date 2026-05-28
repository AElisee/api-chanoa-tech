import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitCommandeService } from './produit_commande.service';
import { ProduitCommandeController } from './produit_commande.controller';
import { ProduitCommande } from './entities/produit_commande.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProduitCommande])],
  controllers: [ProduitCommandeController],
  providers: [ProduitCommandeService],
  exports: [ProduitCommandeService],
})
export class ProduitCommandeModule {}
