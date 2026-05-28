import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Media, MediaType } from './entities/media.entity';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async saveTemporary(file: Express.Multer.File): Promise<{ url: string }> {
    const media = this.mediaRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      type: MediaType.OTHER,
      productId: null,
      categoryId: null,
      alt: null,
    });
    const saved = await this.mediaRepository.save(media);
    return { url: saved.url };
  }

  async saveForProduit(file: Express.Multer.File, productId: string): Promise<Media> {
    const media = this.mediaRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      type: MediaType.PRODUCT,
      productId,
      categoryId: null,
      alt: null,
    });
    return this.mediaRepository.save(media);
  }

  async saveForCategorie(file: Express.Multer.File, categoryId: string): Promise<Media> {
    const media = this.mediaRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      type: MediaType.CATEGORY,
      categoryId,
      productId: null,
      alt: null,
    });
    return this.mediaRepository.save(media);
  }

  async findAll(pagination: PaginationDto = {}) {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.mediaRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException(`Media #${id} introuvable`);
    return media;
  }

  async update(id: string, dto: UpdateMediaDto): Promise<Media> {
    await this.findOne(id);
    await this.mediaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    const filePath = join('./uploads', media.filename);
    if (existsSync(filePath)) unlinkSync(filePath);
    await this.mediaRepository.softDelete(id);
  }
}
