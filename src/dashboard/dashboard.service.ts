import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Commande, OrderStatus } from '../commande/entities/commande.entity';
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Compteurs de base
    const [totalOrders, totalProducts, totalUsers, pendingOrders] = await Promise.all([
      this.commandeRepo.count(),
      this.produitRepo.count({ where: { is_active: true } }),
      this.userRepo.count(),
      this.commandeRepo.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    // Chiffre d'affaires 7 derniers jours
    const revenueRaw = await this.commandeRepo
      .createQueryBuilder('c')
      .select('SUM(c.total)', 'revenue')
      .where('c.createdAt >= :date', { date: sevenDaysAgo })
      .andWhere('c.deletedAt IS NULL')
      .getRawOne<{ revenue: string | null }>();

    // Produits en stock faible (< 5) — retourne les objets complets
    const lowStockProducts = await this.produitRepo.find({
      where: { stock: LessThan(5), is_active: true },
      select: { id: true, name: true, stock: true },
      order: { stock: 'ASC' },
      take: 10,
    });

    // 10 commandes récentes avec nom du client
    const recentOrdersRaw = await this.commandeRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .select([
        'c.id        AS id',
        'c.status    AS status',
        'c.total     AS total',
        'c.createdAt AS created_at',
        'u.name      AS client_name',
      ])
      .where('c.deletedAt IS NULL')
      .orderBy('c.createdAt', 'DESC')
      .limit(10)
      .getRawMany<{
        id: string;
        status: string;
        total: string;
        created_at: Date;
        client_name: string | null;
      }>();

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      status: o.status,
      total: Number(o.total ?? 0),
      created_at: o.created_at instanceof Date ? o.created_at.toISOString() : String(o.created_at),
      client_name: o.client_name ?? null,
    }));

    // Revenus par jour sur 7 jours
    const weekOrdersRaw = await this.commandeRepo
      .createQueryBuilder('c')
      .select('DATE(c.createdAt)', 'date')
      .addSelect('SUM(c.total)', 'total')
      .where('c.createdAt >= :date', { date: sevenDaysAgo })
      .andWhere('c.deletedAt IS NULL')
      .groupBy('DATE(c.createdAt)')
      .orderBy('DATE(c.createdAt)', 'ASC')
      .getRawMany<{ date: string; total: string }>();

    const weekOrders = weekOrdersRaw.map((o) => ({
      date: o.date,
      total: Number(o.total ?? 0),
    }));

    return {
      totalOrders,
      totalProducts,
      totalUsers,
      revenue7d: Number(revenueRaw?.revenue ?? 0),
      pendingOrders,
      lowStockProducts,
      recentOrders,
      weekOrders,
    };
  }
}
