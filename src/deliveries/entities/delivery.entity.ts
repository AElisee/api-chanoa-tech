import { Commande } from 'src/commande/entities/commande.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DeliveryStatus {
  PENDING           = 'pending',
  PICKED_UP         = 'picked_up',
  IN_TRANSIT        = 'in_transit',
  OUT_FOR_DELIVERY  = 'out_for_delivery',
  DELIVERED         = 'delivered',
  FAILED            = 'failed',
  RETURNED          = 'returned',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { name: 'tracking_number', length: 100, nullable: true })
  tracking_number: string;

  @Column('varchar', { name: 'carrier', length: 100, nullable: true })
  carrier: string;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @Column('varchar', { name: 'notes', length: 255, nullable: true })
  notes: string;

  @Column('datetime', { name: 'shipped_at', nullable: true })
  shipped_at: Date | null;

  @Column('datetime', { name: 'delivered_at', nullable: true })
  delivered_at: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToOne(() => Commande, (commande) => commande.delivery, { nullable: true })
  commande: Commande;
}
