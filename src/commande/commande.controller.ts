import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query, Request, UseGuards } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@Controller('commande')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  // Accessible aux invités ET aux utilisateurs connectés
  @Public()
  @UseGuards(OptionalJwtGuard)
  @Post()
  create(@Body() dto: CreateCommandeDto, @Request() req) {
    if (req.user?.id) dto.userId = req.user.id;
    return this.commandeService.create(dto);
  }

  @RequiredPermission('livreur', 'admin')
  @Get()
  findAll(@Query() pagination: PaginationDto, @Request() req) {
    return this.commandeService.findAll(pagination, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.commandeService.findOne(id, req.user);
  }

  @RequiredPermission('livreur', 'admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCommandeDto) {
    return this.commandeService.update(id, dto);
  }

  @RequiredPermission('livreur', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.commandeService.remove(id);
  }
}
