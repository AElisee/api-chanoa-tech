import { Categorie } from 'src/categorie/entities/categorie.entity';
import { ProduitCommande } from 'src/produit_commande/entities/produit_commande.entity';
import { ProduitPanier } from 'src/produit_panier/entities/produit_panier.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('products')
export class Produit {
  @PrimaryGeneratedColumn('increment', {
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

  @Column('varchar', {
    length: 100,
    nullable: false,
    name: 'name',
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
  })
  description: string;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    name: 'price',
    nullable: false,
    comment: 'Price when buying in bulk/pack',
  })
  price: number;

  @Column('numeric', {
    name: 'compare_price ',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Price per single unit',
  })
  compare_price: number;

  @Column('numeric', {
    name: 'stock',
    nullable: true,
    comment: 'Price per single unit',
  })
  stock: number;

  @Column('text', {
    name: 'images',
    nullable: true,
  })
  images: string[]; // prevoir une entité image

  @Column('boolean', {
    name: 'is_active',
    nullable: false,
    default: true,
  })
  is_active: boolean;

  @Column('varchar', {
    name: 'search_vector',
  })
  search_vector: string;

  @Column({
    name: 'categorie_id',
    nullable: true,
  })
  categoryId: number | null;

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

  @ManyToOne(() => Categorie, (category) => category.product, {
    onDelete: 'CASCADE', // Suppression en cascade si hard delete
    orphanedRowAction: 'soft-delete', // Soft delete si la catégorie est supprimée
  })
  @JoinColumn({
    name: 'categorie_id',
    referencedColumnName: 'id',
  })
  categorie: Categorie;

  @OneToMany(() => ProduitPanier, (produitPanier) => produitPanier.product)
  produiPanier: ProduitPanier[];

  @OneToMany(
    () => ProduitCommande,
    (produitCommande) => produitCommande.product,
  )
  produitCommande: ProduitCommande[];
}
