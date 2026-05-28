import { User } from 'src/user/entities/user.entity';
import { ProduitCommande } from 'src/produit_commande/entities/produit_commande.entity';
import { Delivery } from 'src/deliveries/entities/delivery.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Commande {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    comment: 'Current status of the order',
  })
  status: OrderStatus;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    comment: 'Total order amount',
    nullable: true,
  })
  total: number;

  @Column('varchar', { name: 'notes', length: 255, nullable: true })
  notes: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ProduitCommande, (item) => item.commande, { cascade: true })
  items: ProduitCommande[];

  @OneToOne(() => Delivery, (delivery) => delivery.commande, { nullable: true, cascade: true })
  @JoinColumn()
  delivery: Delivery;
}
