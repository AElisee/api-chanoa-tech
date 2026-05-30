import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Categorie } from './entities/categorie.entity';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategorieService {
  constructor(
    @InjectRepository(Categorie)
    private readonly categorieRepository: Repository<Categorie>,
  ) {}

  private async generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = slugify(base, { lower: true, strict: true });
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
      const found = await this.categorieRepository.findOne({ where: { slug: candidate } });
      if (!found || found.id === excludeId) return candidate;
      suffix++;
    }
  }

  async create(dto: CreateCategorieDto): Promise<Categorie> {
    const slug = dto.slug
      ? dto.slug
      : await this.generateUniqueSlug(dto.name);

    const existing = await this.categorieRepository.findOne({ where: { slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" déjà utilisé`);

    // parentId doit être converti en relation TypeORM (pas une colonne directe sur l'entité)
    const { parentId, ...rest } = dto;
    const categorie = this.categorieRepository.create({
      ...rest,
      slug,
      ...(parentId ? { parent: { id: parentId } as Categorie } : {}),
    });
    return this.categorieRepository.save(categorie);
  }

  async findAll(pagination: PaginationDto = {}, requestingUser?: any) {
    const { page = 1, limit = 20 } = pagination;

    const qb = this.categorieRepository
      .createQueryBuilder('cat')
      .loadRelationCountAndMap(
        'cat.product_count',
        'cat.produits',
        'p',
        (qb) => qb.andWhere('p.is_active = :pActive', { pActive: true }),
      )
      .orderBy('cat.sort_order', 'ASC')
      .addOrderBy('cat.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (!requestingUser || requestingUser.role !== 'admin') {
      qb.where('cat.is_active = :catActive', { catActive: true });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Categorie> {
    const categorie = await this.categorieRepository.findOne({ where: { id } });
    if (!categorie) throw new NotFoundException(`Catégorie #${id} introuvable`);
    return categorie;
  }

  async update(id: string, dto: UpdateCategorieDto): Promise<Categorie> {
    await this.findOne(id);
    await this.categorieRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const categorie = await this.findOne(id);
    await this.categorieRepository.softRemove(categorie);
  }
}
