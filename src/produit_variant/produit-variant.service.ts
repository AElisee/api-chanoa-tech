import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduitVariant } from './entities/produit-variant.entity';
import { CreateProduitVariantDto } from './dto/create-produit-variant.dto';
import { UpdateProduitVariantDto } from './dto/update-produit-variant.dto';

@Injectable()
export class ProduitVariantService {
  constructor(
    @InjectRepository(ProduitVariant)
    private readonly variantRepository: Repository<ProduitVariant>,
  ) {}

  findByProduct(productId: string): Promise<ProduitVariant[]> {
    return this.variantRepository.find({
      where: { product: { id: productId } },
      order: { sort_order: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(productId: string, dto: CreateProduitVariantDto): Promise<ProduitVariant> {
    const variant = this.variantRepository.create({
      ...dto,
      product: { id: productId },
    });
    return this.variantRepository.save(variant);
  }

  async update(id: string, dto: UpdateProduitVariantDto): Promise<ProduitVariant> {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) throw new NotFoundException(`Variante #${id} introuvable`);
    await this.variantRepository.update(id, dto);
    return this.variantRepository.findOne({ where: { id } }) as Promise<ProduitVariant>;
  }

  async remove(id: string): Promise<void> {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) throw new NotFoundException(`Variante #${id} introuvable`);
    await this.variantRepository.delete(id);
  }
}
