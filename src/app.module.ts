import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProduitsModule } from './produits/produits.module';
import { PanierModule } from './panier/panier.module';
import { CommandeModule } from './commande/commande.module';
import { UserModule } from './user/user.module';
import { CategorieModule } from './categorie/categorie.module';
import { ProduitPanierModule } from './produit_panier/produit_panier.module';
import { ProduitCommandeModule } from './produit_commande/produit_commande.module';
import { DeliveriesModule } from './deliveries/deliveries.module';

@Module({
  imports: [ProduitsModule, PanierModule, CommandeModule, UserModule, CategorieModule, ProduitPanierModule, ProduitCommandeModule, DeliveriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
