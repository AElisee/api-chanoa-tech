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

@Entity('order_items')
export class ProduitCommande {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

  @PrimaryColumn('integer', {
    name: 'product_id',
    comment: 'Foreign key to permissions table',
  })
  productId: number;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    comment: 'Total order amount',
    nullable: false,
  })
  quantity: number;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    comment: 'Total order price',
    nullable: false,
  })
  price: number;

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

  @ManyToOne(() => Produit, (produit) => produit.produitCommande, {
    nullable: false,
  })
  @JoinColumn({ name: 'product_id' })
  product: Produit;
}
