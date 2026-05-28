import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PanierService } from './panier.service';
import { PanierController } from './panier.controller';
import { Panier } from './entities/panier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Panier])],
  controllers: [PanierController],
  providers: [PanierService],
  exports: [PanierService],
})
export class PanierModule {}
