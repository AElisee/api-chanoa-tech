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

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'id',
    comment: 'Primary key (auto-increment)',
  })
  id: number;

  @Column('varchar', {
    name: 'tracking_number',
    length: 100,
  })
  tracking_number: string;

  @Column('varchar', {
    name: 'carrier',
    length: 100,
  })
  carrier: string;

  @Column('varchar', {
    name: 'status',
    length: 100,
  })
  status: string;

  @Column('varchar', {
    name: 'notes',
    length: 100,
  })
  notes: string;

  @Column('timestamp with time zone', {
    name: 'shipped_at',
    nullable: true,
    comment: 'Estimated/Actual delivery date',
  })
  shipped_at: Date | null;

  @Column('timestamp with time zone', {
    name: 'delivered_at',
    nullable: true,
    comment: 'Estimated/Actual delivery date',
  })
  delivered_at: Date | null;

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
