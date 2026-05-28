import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { ProduitCommandeService } from './produit_commande.service';
import { CreateProduitCommandeDto } from './dto/create-produit_commande.dto';
import { UpdateProduitCommandeDto } from './dto/update-produit_commande.dto';

@Controller('produit-commande')
export class ProduitCommandeController {
  constructor(private readonly produitCommandeService: ProduitCommandeService) {}

  @Post()
  create(@Body() dto: CreateProduitCommandeDto) {
    return this.produitCommandeService.create(dto);
  }

  @Get()
  findAll() {
    return this.produitCommandeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitCommandeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProduitCommandeDto) {
    return this.produitCommandeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitCommandeService.remove(id);
  }
}
