import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduitPanier } from './entities/produit_panier.entity';
import { CreateProduitPanierDto } from './dto/create-produit_panier.dto';
import { UpdateProduitPanierDto } from './dto/update-produit_panier.dto';

@Injectable()
export class ProduitPanierService {
  constructor(
    @InjectRepository(ProduitPanier)
    private readonly produitPanierRepository: Repository<ProduitPanier>,
  ) {}

  async create(dto: CreateProduitPanierDto): Promise<ProduitPanier> {
    const existing = await this.produitPanierRepository.findOne({
      where: { productId: dto.productId, panierId: dto.panierId },
    });
    if (existing) {
      existing.quantity += dto.quantity;
      return this.produitPanierRepository.save(existing);
    }
    const item = this.produitPanierRepository.create(dto);
    return this.produitPanierRepository.save(item);
  }

  async findAll(): Promise<ProduitPanier[]> {
    return this.produitPanierRepository.find({ relations: ['product', 'panier'] });
  }

  async findOne(id: string): Promise<ProduitPanier> {
    const item = await this.produitPanierRepository.findOne({
      where: { id },
      relations: ['product', 'panier'],
    });
    if (!item) throw new NotFoundException(`Article panier #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdateProduitPanierDto): Promise<ProduitPanier> {
    await this.findOne(id);
    await this.produitPanierRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.produitPanierRepository.softDelete(id);
  }
}
