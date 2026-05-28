import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

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

  async findAll(pagination: PaginationDto = {}) {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.deliveryRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

  findByCommande(commandeId: string): Promise<Delivery | null> {
    return this.deliveryRepository.findOne({
      where: { commande: { id: commandeId } },
      relations: { commande: true },
    });
  }
}
