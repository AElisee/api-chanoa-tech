import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query, UseGuards, Request } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';
import { GetProduitsDto } from './dto/get-produits.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@SkipThrottle()
@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @RequiredPermission('admin')
  @Post()
  create(@Body() dto: CreateProduitDto) {
    return this.produitsService.create(dto);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get()
  findAll(@Query() pagination: GetProduitsDto, @Request() req: any) {
    return this.produitsService.findAll(pagination, req.user);
  }

  @Public()
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.produitsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitsService.findOne(id);
  }

  @RequiredPermission('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProduitDto) {
    return this.produitsService.update(id, dto);
  }

  @RequiredPermission('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produitsService.remove(id);
  }
}
