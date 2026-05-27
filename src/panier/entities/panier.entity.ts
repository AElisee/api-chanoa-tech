import { ProduitPanier } from 'src/produit_panier/entities/produit_panier.entity';
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

@Entity('carts')
export class Panier {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

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

  @ManyToOne(() => ProduitPanier, (panier) => panier.panier, {
    onDelete: 'CASCADE',
  })
  produit_panier: ProduitPanier[];
}
