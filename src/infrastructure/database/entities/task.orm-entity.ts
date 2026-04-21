import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserOrmEntity } from './user.orm-entity';
import * as taskEntity from '../../../domain/entities/task.entity';

@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'done'],
  })
  status!: taskEntity.TaskStatus;

  @ManyToOne(() => UserOrmEntity, (user) => user.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  // 🔥 Automático (mejor práctica)
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}