import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Panier } from './entities/panier.entity';
import { CreatePanierDto } from './dto/create-panier.dto';
import { UpdatePanierDto } from './dto/update-panier.dto';

@Injectable()
export class PanierService {
  constructor(
    @InjectRepository(Panier)
    private readonly panierRepository: Repository<Panier>,
  ) {}

  async create(dto: CreatePanierDto): Promise<Panier> {
    const panier = this.panierRepository.create(dto);
    return this.panierRepository.save(panier);
  }

  async findAll(): Promise<Panier[]> {
    return this.panierRepository.find({ relations: { items: { product: true }, user: true } });
  }

  async findOne(id: string): Promise<Panier> {
    const panier = await this.panierRepository.findOne({
      where: { id },
      relations: { items: { product: true }, user: true },
    });
    if (!panier) throw new NotFoundException(`Panier #${id} introuvable`);
    return panier;
  }

  async findByUser(userId: string): Promise<Panier | null> {
    return this.panierRepository.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });
  }

  async update(id: string, dto: UpdatePanierDto): Promise<Panier> {
    await this.findOne(id);
    await this.panierRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.panierRepository.softDelete(id);
  }
}
