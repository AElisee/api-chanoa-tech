import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { AdminLogsService } from './admin-logs.service';
import { AdminLogsController } from './admin-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminActivityLog])],
  controllers: [AdminLogsController],
  providers: [AdminLogsService],
  exports: [AdminLogsService],
})
export class AdminLogsModule {}
