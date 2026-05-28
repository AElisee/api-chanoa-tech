import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AdminLogsService {
  constructor(
    @InjectRepository(AdminActivityLog)
    private readonly logRepository: Repository<AdminActivityLog>,
  ) {}

  async log(
    adminId: string,
    action: string,
    entity: string,
    entityId?: string,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    const entry = this.logRepository.create({
      admin: { id: adminId },
      action,
      entity,
      entityId,
      payload,
    });
    await this.logRepository.save(entry);
  }

  async findAll(pagination: PaginationDto = {}) {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.logRepository.findAndCount({
      relations: { admin: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
