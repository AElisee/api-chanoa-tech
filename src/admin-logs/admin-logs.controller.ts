import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminLogsService } from './admin-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/logs')
export class AdminLogsController {
  constructor(private readonly adminLogsService: AdminLogsService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.adminLogsService.findAll(pagination);
  }
}
