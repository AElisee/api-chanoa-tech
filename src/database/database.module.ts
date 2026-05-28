import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject: [ConfigService],
      
      useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: true,
          connectTimeoutMS: 10000,
          retryAttempts: 5,
          retryDelay: 3000,
        })
    })
  ],
})
export class DatabaseModule {}
