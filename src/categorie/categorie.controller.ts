import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe } from '@nestjs/common';
import { CategorieService } from './categorie.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';

@Controller('categorie')
export class CategorieController {
  constructor(private readonly categorieService: CategorieService) {}

  @Post()
  create(@Body() dto: CreateCategorieDto) {
    return this.categorieService.create(dto);
  }

  @Get()
  findAll() {
    return this.categorieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categorieService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategorieDto) {
    return this.categorieService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categorieService.remove(id);
  }
}
