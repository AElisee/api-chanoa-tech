import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaultAdmin();
  }

  private async seedDefaultAdmin(): Promise<void> {
    const adminExists = await this.userRepository.findOne({
      where: { role: 'admin' },
    });

    if (adminExists) {
      this.logger.log('Admin existant trouvé — aucun seed nécessaire.');
      return;
    }

    const email = this.configService.getOrThrow<string>('DEFAULT_ADMIN_EMAIL');
    const password = this.configService.getOrThrow<string>('DEFAULT_ADMIN_PASSWORD');
    const name = this.configService.getOrThrow<string>('DEFAULT_ADMIN_NAME');

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    });

    try {
      await this.userRepository.save(admin);
      this.logger.log(`Admin par défaut créé : ${email}`);
      this.logger.warn('Pensez à changer le mot de passe par défaut en production !');
    } catch (error) {
      this.logger.error(
        `Echec de la création de l'admin par défaut : ${(error as Error).message}`,
      );
    }
  }
}
