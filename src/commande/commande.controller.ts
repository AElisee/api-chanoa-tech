import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';

@Controller('commande')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Post()
  create(@Body() dto: CreateCommandeDto) {
    return this.commandeService.create(dto);
  }

  @Get()
  findAll() {
    return this.commandeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commandeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCommandeDto) {
    return this.commandeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.commandeService.remove(id);
  }
}
