import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from './entities/produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
  ) {}

  async create(dto: CreateProduitDto): Promise<Produit> {
    const existing = await this.produitRepository.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" déjà utilisé`);

    const produit = this.produitRepository.create(dto);
    return this.produitRepository.save(produit);
  }

  async findAll(): Promise<Produit[]> {
    return this.produitRepository.find({
      where: { is_active: true },
      relations: ['categorie'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['categorie'],
    });
    if (!produit) throw new NotFoundException(`Produit #${id} introuvable`);
    return produit;
  }

  async update(id: string, dto: UpdateProduitDto): Promise<Produit> {
    await this.findOne(id);
    await this.produitRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.produitRepository.softDelete(id);
  }
}
