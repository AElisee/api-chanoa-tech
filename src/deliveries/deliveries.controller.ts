import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @RequiredPermission('livreur', 'admin')
  @Post()
  create(@Body() dto: CreateDeliveryDto) {
    return this.deliveriesService.create(dto);
  }

  @RequiredPermission('livreur', 'admin')
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.deliveriesService.findAll(pagination);
  }

  @Get('commande/:commandeId')
  findByCommande(@Param('commandeId', ParseUUIDPipe) commandeId: string) {
    return this.deliveriesService.findByCommande(commandeId);
  }

  @RequiredPermission('livreur', 'admin')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDeliveryDto) {
    return this.deliveriesService.update(id, dto);
  }

  @RequiredPermission('livreur', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveriesService.remove(id);
  }
}
