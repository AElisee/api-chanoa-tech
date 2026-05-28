import { Produit } from 'src/produits/entities/produit.entity';
import { Commande } from 'src/commande/entities/commande.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('order_items')
export class ProduitCommande {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'product_id', nullable: false })
  productId: string;

  @Column({ name: 'commande_id', nullable: false })
  commandeId: string;

  @Column('int', { nullable: false })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ type: 'json', nullable: true, name: 'product_snapshot' })
  productSnapshot: Record<string, unknown>;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Produit, (produit) => produit.produitCommande, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Produit;

  @ManyToOne(() => Commande, (commande) => commande.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commande_id' })
  commande: Commande;
}
