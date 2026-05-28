import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from './entities/commande.entity';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async create(dto: CreateCommandeDto): Promise<Commande> {
    const commande = this.commandeRepository.create(dto);
    return this.commandeRepository.save(commande);
  }

  async findAll(): Promise<Commande[]> {
    return this.commandeRepository.find({
      relations: ['user', 'items', 'items.product', 'delivery'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'delivery'],
    });
    if (!commande) throw new NotFoundException(`Commande #${id} introuvable`);
    return commande;
  }

  async findByUser(userId: string): Promise<Commande[]> {
    return this.commandeRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'delivery'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateCommandeDto): Promise<Commande> {
    await this.findOne(id);
    await this.commandeRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.commandeRepository.softDelete(id);
  }
}
