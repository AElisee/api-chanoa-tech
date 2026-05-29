import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query, Request } from '@nestjs/common';
import { PanierService } from './panier.service';
import { CreatePanierDto } from './dto/create-panier.dto';
import { UpdatePanierDto } from './dto/update-panier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';

@Controller('panier')
export class PanierController {
  constructor(private readonly panierService: PanierService) {}

  @RequiredPermission('admin')
  @Post()
  create(@Body() dto: CreatePanierDto) {
    return this.panierService.create(dto);
  }

  @RequiredPermission('admin')
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.panierService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.panierService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePanierDto, @Request() req) {
    return this.panierService.update(id, dto, req.user);
  }

  @RequiredPermission('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.panierService.remove(id, req.user);
  }
}
