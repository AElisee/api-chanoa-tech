import { Panier } from 'src/panier/entities/panier.entity';
import { Produit } from 'src/produits/entities/produit.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  BeforeRemove,
  getManager,
} from 'typeorm';

@Entity('carts_items')
export class ProduitPanier {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

  @Column('integer', {
    name: 'quantity',
    nullable: true,
    default: 1,
  })
  quantity: number;

  @PrimaryColumn('integer', {
    name: 'product_id',
    comment: 'Foreign key to permissions table',
  })
  productId: number;

  @PrimaryColumn('integer', {
    name: 'panier_id',
    comment: 'Foreign key to permissions table',
  })
  productId: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;

  @ManyToOne(() => Produit, (produit) => produit.produitPanier, {
    nullable: false,
  })
  @JoinColumn({ name: 'product_id' })
  product: Produit;

  @ManyToOne(() => Panier, (panier) => panier.produit_panier, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'panier_id' })
  panier: Panier;
}
