import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduitCommande } from './entities/produit_commande.entity';
import { CommandeService } from '../commande/commande.service';
import { CreateProduitCommandeDto } from './dto/create-produit_commande.dto';
import { UpdateProduitCommandeDto } from './dto/update-produit_commande.dto';

@Injectable()
export class ProduitCommandeService {
  constructor(
    @InjectRepository(ProduitCommande)
    private readonly produitCommandeRepository: Repository<ProduitCommande>,
    private readonly commandeService: CommandeService,
  ) {}

  async create(dto: CreateProduitCommandeDto): Promise<ProduitCommande> {
    const item = this.produitCommandeRepository.create(dto);
    const saved = await this.produitCommandeRepository.save(item);
    await this.commandeService.recalculerTotal(dto.commandeId);
    return saved;
  }

  async findAll(): Promise<ProduitCommande[]> {
    return this.produitCommandeRepository.find({ relations: { product: true, commande: true } });
  }

  async findOne(id: string): Promise<ProduitCommande> {
    const item = await this.produitCommandeRepository.findOne({
      where: { id },
      relations: { product: true, commande: true },
    });
    if (!item) throw new NotFoundException(`Article commande #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdateProduitCommandeDto): Promise<ProduitCommande> {
    const item = await this.findOne(id);
    const merged = this.produitCommandeRepository.merge(item, dto);
    await this.produitCommandeRepository.save(merged);
    await this.commandeService.recalculerTotal(item.commandeId);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.produitCommandeRepository.softDelete(id);
    await this.commandeService.recalculerTotal(item.commandeId);
  }
}
