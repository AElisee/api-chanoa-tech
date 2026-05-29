import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';
import { ProduitPanierService } from './produit_panier.service';
import { CreateProduitPanierDto } from './dto/create-produit_panier.dto';
import { UpdateProduitPanierDto } from './dto/update-produit_panier.dto';

@Controller('produit-panier')
export class ProduitPanierController {
  constructor(private readonly produitPanierService: ProduitPanierService) {}

  @Post()
  create(@Body() dto: CreateProduitPanierDto) {
    return this.produitPanierService.create(dto);
  }

  @RequiredPermission('admin')
  @Get()
  findAll() {
    return this.produitPanierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitPanierService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProduitPanierDto) {
    return this.produitPanierService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitPanierService.remove(id);
  }
}
