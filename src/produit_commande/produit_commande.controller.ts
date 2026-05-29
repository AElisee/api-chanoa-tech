import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';
import { ProduitCommandeService } from './produit_commande.service';
import { CreateProduitCommandeDto } from './dto/create-produit_commande.dto';
import { UpdateProduitCommandeDto } from './dto/update-produit_commande.dto';

@Controller('produit-commande')
export class ProduitCommandeController {
  constructor(private readonly produitCommandeService: ProduitCommandeService) {}

  @RequiredPermission('admin')
  @Post()
  create(@Body() dto: CreateProduitCommandeDto) {
    return this.produitCommandeService.create(dto);
  }

  @RequiredPermission('admin')
  @Get()
  findAll() {
    return this.produitCommandeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitCommandeService.findOne(id);
  }

  @RequiredPermission('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProduitCommandeDto) {
    return this.produitCommandeService.update(id, dto);
  }

  @RequiredPermission('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitCommandeService.remove(id);
  }
}
