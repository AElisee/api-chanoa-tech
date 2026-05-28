import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduitCommande } from './entities/produit_commande.entity';
import { CreateProduitCommandeDto } from './dto/create-produit_commande.dto';
import { UpdateProduitCommandeDto } from './dto/update-produit_commande.dto';

@Injectable()
export class ProduitCommandeService {
  constructor(
    @InjectRepository(ProduitCommande)
    private readonly produitCommandeRepository: Repository<ProduitCommande>,
  ) {}

  async create(dto: CreateProduitCommandeDto): Promise<ProduitCommande> {
    const item = this.produitCommandeRepository.create(dto);
    return this.produitCommandeRepository.save(item);
  }

  async findAll(): Promise<ProduitCommande[]> {
    return this.produitCommandeRepository.find({ relations: ['product', 'commande'] });
  }

  async findOne(id: string): Promise<ProduitCommande> {
    const item = await this.produitCommandeRepository.findOne({
      where: { id },
      relations: ['product', 'commande'],
    });
    if (!item) throw new NotFoundException(`Article commande #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdateProduitCommandeDto): Promise<ProduitCommande> {
    await this.findOne(id);
    await this.produitCommandeRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.produitCommandeRepository.softDelete(id);
  }
}
