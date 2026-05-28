import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';

@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @Post()
  create(@Body() dto: CreateProduitDto) {
    return this.produitsService.create(dto);
  }

  @Get()
  findAll() {
    return this.produitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProduitDto) {
    return this.produitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitsService.remove(id);
  }
}
