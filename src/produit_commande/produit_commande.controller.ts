import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProduitCommandeService } from './produit_commande.service';
import { CreateProduitCommandeDto } from './dto/create-produit_commande.dto';
import { UpdateProduitCommandeDto } from './dto/update-produit_commande.dto';

@Controller('produit-commande')
export class ProduitCommandeController {
  constructor(private readonly produitCommandeService: ProduitCommandeService) {}

  @Post()
  create(@Body() createProduitCommandeDto: CreateProduitCommandeDto) {
    return this.produitCommandeService.create(createProduitCommandeDto);
  }

  @Get()
  findAll() {
    return this.produitCommandeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produitCommandeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProduitCommandeDto: UpdateProduitCommandeDto) {
    return this.produitCommandeService.update(+id, updateProduitCommandeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produitCommandeService.remove(+id);
  }
}
