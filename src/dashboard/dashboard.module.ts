import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Commande } from '../commande/entities/commande.entity';
import { Produit } from '../produits/entities/produit.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commande, Produit, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
