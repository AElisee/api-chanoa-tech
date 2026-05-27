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
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status_enum',
    default: OrderStatus.PENDING,
    comment: 'Current status of the order',
  })
  status?: OrderStatus;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    comment: 'Total order amount',
    nullable: true,
  })
  total: number;

  @Column('varchar', {
    name: 'notes',
    length: 225,
    nullable: true,
    comment: 'Name of the sales person',
  })
  notes: string;

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
}
