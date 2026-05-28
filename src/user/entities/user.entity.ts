import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { name: 'email', length: 100, unique: true, nullable: false })
  email: string;

  @Column('varchar', { name: 'full_name', length: 255, nullable: false })
  name: string;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column('varchar', { name: 'password', nullable: false, select: false })
  password: string;

  @Column('varchar', { name: 'role', nullable: false, default: 'client' })
  role: string;

  @Column('varchar', { name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken: string | null;

  @Column('datetime', { name: 'password_reset_expires', nullable: true, select: false })
  passwordResetExpires: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
