import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @RequiredPermission('admin')
  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }
}
