import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProduitsModule } from './produits/produits.module';
import { PanierModule } from './panier/panier.module';
import { CommandeModule } from './commande/commande.module';
import { UserModule } from './user/user.module';
import { CategorieModule } from './categorie/categorie.module';
import { ProduitPanierModule } from './produit_panier/produit_panier.module';
import { ProduitCommandeModule } from './produit_commande/produit_commande.module';
import { DeliveriesModule } from './deliveries/deliveries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().default('development'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().optional().allow(''),
        DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('60m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
      }),
    }),
    DatabaseModule,
    AuthModule,
    ProduitsModule,
    PanierModule,
    CommandeModule,
    UserModule,
    CategorieModule,
    ProduitPanierModule,
    ProduitCommandeModule,
    DeliveriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
