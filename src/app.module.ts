import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { MediaModule } from './media/media.module';
import { PaymentModule } from './payment/payment.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { ProduitVariantModule } from './produit_variant/produit-variant.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminLogsModule } from './admin-logs/admin-logs.module';
import { SeedModule } from './seed/seed.module';

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
        GENIUSPAY_API_SECRET: Joi.string().required(),
        DEFAULT_ADMIN_EMAIL: Joi.string().email().required(),
        DEFAULT_ADMIN_PASSWORD: Joi.string().min(8).required(),
        DEFAULT_ADMIN_NAME: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 10,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
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
    MediaModule,
    PaymentModule,
    ProduitVariantModule,
    DashboardModule,
    AdminLogsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
