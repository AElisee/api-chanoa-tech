import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande, OrderStatus } from './entities/commande.entity';
import { ProduitCommande } from '../produit_commande/entities/produit_commande.entity';
import { ProduitsService } from '../produits/produits.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CommandeService {
  private readonly logger = new Logger(CommandeService.name);

  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
    @InjectRepository(ProduitCommande)
    private readonly produitCommandeRepository: Repository<ProduitCommande>,
    private readonly produitsService: ProduitsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateCommandeDto): Promise<Commande> {
    return this.commandeRepository.manager.transaction(async (manager) => {
      // 1. Créer la commande sans items ni total
      const commande = manager.create(Commande, {
        status: OrderStatus.PENDING,
        guestEmail: dto.guestEmail ?? null,
        shippingAddress: dto.shippingAddress ?? null,
        notes: dto.notes ?? null,
        paymentMethod: dto.paymentMethod ?? null,
        userId: dto.userId ?? null,
      });
      const savedCommande = await manager.save(Commande, commande);

      // 2. Créer les items avec vérification et snapshot
      let total = 0;
      if (dto.items?.length) {
        for (const item of dto.items) {
          // Vérifier existence et disponibilité du produit
          const produit = await this.produitsService.findOne(item.productId);
          if (!produit.is_active) {
            throw new BadRequestException(`Produit "${produit.name}" n'est plus disponible`);
          }
          if (produit.stock !== null && produit.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuffisant pour "${produit.name}" (disponible : ${produit.stock}, demandé : ${item.quantity})`,
            );
          }

          const unitPrice = Number(produit.price); // Prix vérifié en base
          total += unitPrice * item.quantity;

          await manager.save(ProduitCommande, {
            commandeId: savedCommande.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            productSnapshot: {
              name: produit.name,
              sku: produit.sku ?? null,
              brand: produit.brand ?? null,
              price: produit.price,
              image: produit.images?.[0] ?? null,
            },
          });
        }

        // 3. Mettre à jour le total
        await manager.update(Commande, savedCommande.id, { total });
      }

      const result = await this.findOne(savedCommande.id);

      // Envoyer l'email de confirmation (ne pas bloquer si échec)
      const recipientEmail = dto.guestEmail ?? result.user?.email;
      if (recipientEmail) {
        const emailItems = result.items?.map(i => ({
          name: (i.productSnapshot as any)?.name ?? 'Produit',
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })) ?? [];
        this.mailService.sendOrderConfirmation(
          recipientEmail,
          result.id,
          emailItems,
          Number(result.total),
          dto.paymentMethod ?? 'genius_pay',
        ).catch(err => this.logger.warn(`Email confirmation failed: ${err.message}`));
      }

      return result;
    });
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

    if (dto.status && dto.status !== commande.status) {
      const updated = await this.findOne(id);
      const recipientEmail = updated.guestEmail ?? updated.user?.email;
      if (recipientEmail) {
        const trackingNumber = updated.delivery?.tracking_number ?? null;
        this.mailService.sendOrderStatusUpdate(
          recipientEmail,
          id,
          dto.status,
          trackingNumber,
        ).catch(err => this.logger.warn(`Email status update failed: ${err.message}`));
      }
    }

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
