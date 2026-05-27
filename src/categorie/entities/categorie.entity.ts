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

@Entity('categories')
export class Categorie {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

  @Column('varchar', {
    name: 'name',
    length: 100,
    nullable: false,
    comment: 'Display name of the category',
  })
  name: string;

  @Column('varchar', {
    name: 'slug',
    unique: true,
    nullable: false,
  })
  slug: string;

  @Column('text', {
    name: 'description',
    nullable: true,
    comment: 'Detailed description of the category',
  })
  description?: string;

  @Column('text', {
    name: 'image_url',
  })
  image_url?: string;

  @Column('boolean', {
    name: 'is_active',
    nullable: false,
    default: true,
  })
  is_active: boolean;

  @Column('integer', {
    name: 'sort_order',
  })
  sort_order: number;

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

  // Relation avec produit
  @OneToMany(() => Produit, (product) => product.categorie, {
    cascade: ['soft-remove'], // Soft remove en cascade
  })
  product: Product[];
}
