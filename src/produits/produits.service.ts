import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Produit } from './entities/produit.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
  ) {}

  private async generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = slugify(base, { lower: true, strict: true });
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
      const found = await this.produitRepository.findOne({ where: { slug: candidate } });
      if (!found || found.id === excludeId) return candidate;
      suffix++;
    }
  }

  async create(dto: CreateProduitDto): Promise<Produit> {
    const slug = dto.slug
      ? dto.slug
      : await this.generateUniqueSlug(dto.name);

    const existing = await this.produitRepository.findOne({ where: { slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" déjà utilisé`);

    const produit = this.produitRepository.create({ ...dto, slug });
    return this.produitRepository.save(produit);
  }

  async findAll(pagination: PaginationDto = {}) {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.produitRepository.findAndCount({
      where: { is_active: true },
      relations: { categorie: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: { categorie: true },
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

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const produit = await this.findOne(productId);
    if (produit.stock !== null && produit.stock < quantity) {
      throw new BadRequestException(`Stock insuffisant pour le produit #${productId}`);
    }
    if (produit.stock !== null) {
      await this.produitRepository.decrement({ id: productId }, 'stock', quantity);
    }
  }
}
