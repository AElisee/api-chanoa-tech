import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande, OrderStatus } from './entities/commande.entity';
import { ProduitCommande } from '../produit_commande/entities/produit_commande.entity';
import { ProduitsService } from '../produits/produits.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
    @InjectRepository(ProduitCommande)
    private readonly produitCommandeRepository: Repository<ProduitCommande>,
    private readonly produitsService: ProduitsService,
  ) {}

  async create(dto: CreateCommandeDto): Promise<Commande> {
    const commande = this.commandeRepository.create(dto);
    return this.commandeRepository.save(commande);
  }

  async findAll(pagination: PaginationDto = {}, requestingUser?: User) {
    const { page = 1, limit = 20 } = pagination;
    const where = requestingUser?.role === 'client' ? { userId: requestingUser.id } : {};
    const [data, total] = await this.commandeRepository.findAndCount({
      where,
      relations: { user: true, items: { product: true }, delivery: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, requestingUser?: User): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true }, delivery: true },
    });
    if (!commande) throw new NotFoundException(`Commande #${id} introuvable`);
    if (requestingUser?.role === 'client' && commande.userId !== requestingUser.id) {
      throw new ForbiddenException('Accès refusé : cette commande ne vous appartient pas');
    }
    return commande;
  }

  async findByUser(userId: string): Promise<Commande[]> {
    return this.commandeRepository.find({
      where: { userId },
      relations: { items: { product: true }, delivery: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateCommandeDto): Promise<Commande> {
    const commande = await this.findOne(id);

    if (dto.status === OrderStatus.CONFIRMED && commande.status !== OrderStatus.CONFIRMED) {
      const items = await this.produitCommandeRepository.find({
        where: { commandeId: id },
      });
      for (const item of items) {
        await this.produitsService.decrementStock(item.productId, item.quantity);
      }
    }

    await this.commandeRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.commandeRepository.softDelete(id);
  }

  async recalculerTotal(commandeId: string): Promise<void> {
    const items = await this.produitCommandeRepository.find({
      where: { commandeId },
    });
    const total = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    await this.commandeRepository.update(commandeId, { total });
  }
}
