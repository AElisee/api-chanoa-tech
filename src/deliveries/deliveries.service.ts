import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDeliveryDto): Promise<Delivery> {
    const delivery = this.deliveryRepository.create({
      tracking_number: dto.tracking_number,
      carrier: dto.carrier,
      status: dto.status,
      notes: dto.notes,
      shipped_at: dto.shipped_at ? new Date(dto.shipped_at) : null,
      delivered_at: dto.delivered_at ? new Date(dto.delivered_at) : null,
    });
    const saved = await this.deliveryRepository.save(delivery);

    // Lier la livraison à la commande (FK deliveryId sur la table orders)
    await this.dataSource
      .createQueryBuilder()
      .update('orders')
      .set({ deliveryId: saved.id } as any)
      .where('id = :id', { id: dto.orderId })
      .execute();

    return saved;
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
