import { Produit } from 'src/produits/entities/produit.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Categorie {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { name: 'name', length: 100, nullable: false })
  name: string;

  @Column('varchar', { name: 'slug', unique: true, nullable: false })
  slug: string;

  @Column('text', { name: 'description', nullable: true })
  description?: string;

  @Column('text', { name: 'image_url', nullable: true })
  image_url?: string;

  @Column('boolean', { name: 'is_active', nullable: false, default: true })
  is_active: boolean;

  @Column('int', { name: 'sort_order', nullable: true, default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Produit, (produit) => produit.categorie, {
    cascade: ['soft-remove'],
  })
  produits: Produit[];
}
