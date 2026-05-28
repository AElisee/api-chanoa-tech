import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';
import { Commande } from './entities/commande.entity';
import { ProduitCommande } from '../produit_commande/entities/produit_commande.entity';
import { ProduitsModule } from '../produits/produits.module';

@Module({
  imports: [TypeOrmModule.forFeature([Commande, ProduitCommande]), ProduitsModule],
  controllers: [CommandeController],
  providers: [CommandeService],
  exports: [CommandeService],
})
export class CommandeModule {}
