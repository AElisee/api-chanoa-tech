import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categorie } from './entities/categorie.entity';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';

@Injectable()
export class CategorieService {
  constructor(
    @InjectRepository(Categorie)
    private readonly categorieRepository: Repository<Categorie>,
  ) {}

  async create(dto: CreateCategorieDto): Promise<Categorie> {
    const existing = await this.categorieRepository.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" déjà utilisé`);

    const categorie = this.categorieRepository.create(dto);
    return this.categorieRepository.save(categorie);
  }

  async findAll(): Promise<Categorie[]> {
    return this.categorieRepository.find({ where: { is_active: true }, order: { sort_order: 'ASC' } });
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
