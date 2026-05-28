import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorieService } from './categorie.service';
import { CategorieController } from './categorie.controller';
import { Categorie } from './entities/categorie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categorie])],
  controllers: [CategorieController],
  providers: [CategorieService],
  exports: [CategorieService],
})
export class CategorieModule {}
