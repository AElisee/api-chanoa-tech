import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { PanierService } from './panier.service';
import { CreatePanierDto } from './dto/create-panier.dto';
import { UpdatePanierDto } from './dto/update-panier.dto';

@Controller('panier')
export class PanierController {
  constructor(private readonly panierService: PanierService) {}

  @Post()
  create(@Body() dto: CreatePanierDto) {
    return this.panierService.create(dto);
  }

  @Get()
  findAll() {
    return this.panierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.panierService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePanierDto) {
    return this.panierService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.panierService.remove(id);
  }
}
