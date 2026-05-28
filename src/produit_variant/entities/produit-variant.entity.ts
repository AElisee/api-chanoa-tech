import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Produit } from '../../produits/entities/produit.entity';

@Entity('produit_variants')
export class ProduitVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Produit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Produit;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'json', nullable: true })
  options: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_eur: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compare_price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
