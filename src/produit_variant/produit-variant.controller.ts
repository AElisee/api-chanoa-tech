import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ProduitVariantService } from './produit-variant.service';
import { CreateProduitVariantDto } from './dto/create-produit-variant.dto';
import { UpdateProduitVariantDto } from './dto/update-produit-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';

@SkipThrottle()
@Controller('produits/:productId/variants')
export class ProduitVariantController {
  constructor(private readonly produitVariantService: ProduitVariantService) {}

  @Public()
  @Get()
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.produitVariantService.findByProduct(productId);
  }

  @RequiredPermission('admin')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProduitVariantDto,
  ) {
    return this.produitVariantService.create(productId, dto);
  }

  @RequiredPermission('admin')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('productId', ParseUUIDPipe) _productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProduitVariantDto,
  ) {
    return this.produitVariantService.update(id, dto);
  }

  @RequiredPermission('admin')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('productId', ParseUUIDPipe) _productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.produitVariantService.remove(id);
  }
}
