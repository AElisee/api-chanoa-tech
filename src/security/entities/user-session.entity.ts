import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('varchar', { name: 'refresh_token', length: 255, nullable: false, unique: true })
  refreshToken: string;

  @Column('varchar', { name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column('varchar', { name: 'user_agent', length: 500, nullable: true })
  userAgent: string;

  @Column('datetime', { name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
