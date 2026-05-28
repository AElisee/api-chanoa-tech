import { Categorie } from 'src/categorie/entities/categorie.entity';
import { ProduitCommande } from 'src/produit_commande/entities/produit_commande.entity';
import { ProduitPanier } from 'src/produit_panier/entities/produit_panier.entity';
import { Media } from 'src/media/entities/media.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductStatus {
  DRAFT    = 'draft',
  ACTIVE   = 'active',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Produit {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { length: 100, nullable: false, name: 'name' })
  name: string;

  @Column('varchar', { name: 'slug', unique: true, nullable: false })
  slug: string;

  @Column('text', { name: 'description', nullable: true })
  description: string;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    name: 'price',
    nullable: false,
    comment: 'Price when buying in bulk/pack',
  })
  price: number;

  @Column('decimal', {
    name: 'compare_price',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Price per single unit',
  })
  compare_price: number;

  @Column('decimal', { name: 'stock', precision: 12, scale: 2, nullable: true })
  stock: number;

  @OneToMany(() => Media, (media) => media.produit, { cascade: ['insert', 'remove'] })
  medias: Media[];

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_eur: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column('boolean', { name: 'is_active', nullable: false, default: true })
  is_active: boolean;

  @Column('varchar', { name: 'search_vector', nullable: true })
  search_vector: string;

  @Column({ name: 'categorie_id', nullable: true })
  categoryId: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Categorie, (categorie) => categorie.produits, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categorie_id', referencedColumnName: 'id' })
  categorie: Categorie;

  @OneToMany(() => ProduitPanier, (produitPanier) => produitPanier.product)
  produitPanier: ProduitPanier[];

  @OneToMany(() => ProduitCommande, (produitCommande) => produitCommande.product)
  produitCommande: ProduitCommande[];
}
