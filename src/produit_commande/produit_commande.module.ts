import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitCommandeService } from './produit_commande.service';
import { ProduitCommandeController } from './produit_commande.controller';
import { ProduitCommande } from './entities/produit_commande.entity';
import { CommandeModule } from '../commande/commande.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProduitCommande]), CommandeModule],
  controllers: [ProduitCommandeController],
  providers: [ProduitCommandeService],
  exports: [ProduitCommandeService],
})
export class ProduitCommandeModule {}
