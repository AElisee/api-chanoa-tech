import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProduitPanierService } from './produit_panier.service';
import { CreateProduitPanierDto } from './dto/create-produit_panier.dto';
import { UpdateProduitPanierDto } from './dto/update-produit_panier.dto';

@Controller('produit-panier')
export class ProduitPanierController {
  constructor(private readonly produitPanierService: ProduitPanierService) {}

  @Post()
  create(@Body() createProduitPanierDto: CreateProduitPanierDto) {
    return this.produitPanierService.create(createProduitPanierDto);
  }

  @Get()
  findAll() {
    return this.produitPanierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produitPanierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProduitPanierDto: UpdateProduitPanierDto) {
    return this.produitPanierService.update(+id, updateProduitPanierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produitPanierService.remove(+id);
  }
}
