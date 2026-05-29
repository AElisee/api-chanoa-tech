import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query } from '@nestjs/common';
import { CategorieService } from './categorie.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('categorie')
export class CategorieController {
  constructor(private readonly categorieService: CategorieService) {}

  @RequiredPermission('admin')
  @Post()
  create(@Body() dto: CreateCategorieDto) {
    return this.categorieService.create(dto);
  }

  @Public()
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.categorieService.findAll(pagination);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categorieService.findOne(id);
  }

  @RequiredPermission('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategorieDto) {
    return this.categorieService.update(id, dto);
  }

  @RequiredPermission('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categorieService.remove(id);
  }
}
