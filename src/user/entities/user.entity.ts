import {
  BeforeInsert,
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
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'uuid', name: 'id' })
  id: number;

  @Column('varchar', {
    name: 'email',
    length: 100,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('varchar', {
    name: 'full_name', // Convention PostgreSQL snake_case
    length: 255,
    nullable: false,
  })
  name: string;

  @Column('varchar', {
    name: 'phone',
    length: 20,
    nullable: true,
  })
  phone: string;

  @Column('varchar', {
    name: 'role',
    nullable: false,
  })
  role: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 3,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    precision: 3,
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
    precision: 3,
  })
  delectedAt: Date | null;
}
