import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
  ) {}

  async create(dto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = this.deliveryRepository.create(dto);
    return this.deliveryRepository.save(delivery);
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });
    if (!delivery) throw new NotFoundException(`Livraison #${id} introuvable`);
    return delivery;
  }

  async update(id: string, dto: UpdateDeliveryDto): Promise<Delivery> {
    await this.findOne(id);
    await this.deliveryRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.deliveryRepository.softDelete(id);
  }
}
