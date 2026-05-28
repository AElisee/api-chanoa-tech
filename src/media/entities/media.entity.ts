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
import { Produit } from 'src/produits/entities/produit.entity';
import { Categorie } from 'src/categorie/entities/categorie.entity';

export enum MediaType {
  PRODUCT  = 'product',
  CATEGORY = 'category',
  OTHER    = 'other',
}

@Entity('medias')
export class Media {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { name: 'filename', nullable: false })
  filename: string;

  @Column('varchar', { name: 'original_name', nullable: false })
  originalName: string;

  @Column('varchar', { name: 'mime_type', length: 100, nullable: false })
  mimeType: string;

  @Column('int', { name: 'size', nullable: false })
  size: number;

  @Column('varchar', { name: 'url', nullable: false })
  url: string;

  @Column('varchar', { name: 'alt', nullable: true })
  alt: string | null;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.OTHER })
  type: MediaType;

  @Column('int', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'product_id', nullable: true, type: 'varchar' })
  productId: string | null;

  @Column({ name: 'category_id', nullable: true, type: 'varchar' })
  categoryId: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Produit, (produit) => produit.medias, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  produit: Produit;

  @ManyToOne(() => Categorie, (categorie) => categorie.medias, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  categorie: Categorie;
}
