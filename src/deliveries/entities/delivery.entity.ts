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

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { name: 'tracking_number', length: 100, nullable: true })
  tracking_number: string;

  @Column('varchar', { name: 'carrier', length: 100, nullable: true })
  carrier: string;

  @Column('varchar', { name: 'status', length: 100, nullable: false, default: 'pending' })
  status: string;

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
