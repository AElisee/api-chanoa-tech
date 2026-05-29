import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Panier } from './entities/panier.entity';
import { CreatePanierDto } from './dto/create-panier.dto';
import { UpdatePanierDto } from './dto/update-panier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../user/entities/user.entity';

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

  async findAll(pagination: PaginationDto = {}) {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.panierRepository.findAndCount({
      relations: { items: { product: true }, user: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, requestingUser?: User): Promise<Panier> {
    const panier = await this.panierRepository.findOne({
      where: { id },
      relations: { items: { product: true }, user: true },
    });
    if (!panier) throw new NotFoundException(`Panier #${id} introuvable`);
    if (requestingUser && requestingUser.role !== 'admin' && panier.userId !== requestingUser.id) {
      throw new ForbiddenException('Accès refusé : ce panier ne vous appartient pas');
    }
    return panier;
  }

  async findByUser(userId: string): Promise<Panier | null> {
    return this.panierRepository.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });
  }

  async update(id: string, dto: UpdatePanierDto, requestingUser?: User): Promise<Panier> {
    await this.findOne(id, requestingUser);
    await this.panierRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string, requestingUser?: User): Promise<void> {
    await this.findOne(id, requestingUser);
    await this.panierRepository.softDelete(id);
  }
}
