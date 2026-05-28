import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Commande } from '../commande/entities/commande.entity';
import { Produit } from '../produits/entities/produit.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepo: Repository<Commande>,
    @InjectRepository(Produit)
    private readonly produitRepo: Repository<Produit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getStats() {
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      this.commandeRepo.count(),
      this.produitRepo.count({ where: { is_active: true } }),
      this.userRepo.count(),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await this.commandeRepo
      .createQueryBuilder('c')
      .select('SUM(c.total)', 'revenue')
      .where('c.createdAt >= :date', { date: sevenDaysAgo })
      .getRawOne<{ revenue: string | null }>();

    const lowStock = await this.produitRepo.count({
      where: { stock: LessThan(5), is_active: true },
    });

    return {
      totalOrders,
      totalProducts,
      totalUsers,
      revenue7d: Number(recentOrders?.revenue ?? 0),
      lowStockProducts: lowStock,
    };
  }
}
