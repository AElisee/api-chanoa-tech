import { Panier } from 'src/panier/entities/panier.entity';
import { Produit } from 'src/produits/entities/produit.entity';
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

@Entity('carts_items')
export class ProduitPanier {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('int', { name: 'quantity', nullable: false, default: 1 })
  quantity: number;

  @Column({ name: 'product_id', nullable: false })
  productId: string;

  @Column({ name: 'panier_id', nullable: false })
  panierId: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Produit, (produit) => produit.produitPanier, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Produit;

  @ManyToOne(() => Panier, (panier) => panier.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panier_id' })
  panier: Panier;
}
