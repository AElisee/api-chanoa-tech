import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query, UseGuards, Request } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CategorieService } from './categorie.service';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@SkipThrottle()
@Controller('categorie')
export class CategorieController {
  constructor(private readonly categorieService: CategorieService) {}

  @RequiredPermission('admin')
  @Post()
  create(@Body() dto: CreateCategorieDto) {
    return this.categorieService.create(dto);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto, @Request() req: any) {
    return this.categorieService.findAll(pagination, req.user);
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
