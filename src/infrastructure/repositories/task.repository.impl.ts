import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task, TaskStatus } from '../../domain/entities/task.entity';
import { TaskOrmEntity } from '../database/entities/task.orm-entity';
import { TaskMapper } from '../mappers/task.mapper';

interface FindByUserOptions {
  skip?: number;
  take?: number;
}

@Injectable()
export class TaskRepositoryImpl implements TaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly repo: Repository<TaskOrmEntity>,
  ) { }

  async create(task: Task): Promise<Task> {
    const ormEntity = TaskMapper.toOrm(task);
    const saved = await this.repo.save(ormEntity);
    return TaskMapper.toDomain(saved);
  }

  async findByUserWithCount(
    userId: string,
    status?: TaskStatus,
    options?: FindByUserOptions,
  ): Promise<{ data: Task[]; total: number }> {
    const where: FindOptionsWhere<TaskOrmEntity> = {
      user: { id: userId },
    };

    if (status) {
      where.status = status;
    }

    const [result, total] = await this.repo.findAndCount({
      where,
      relations: ['user'],
      skip: options?.skip,
      take: options?.take,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: result.map(TaskMapper.toDomain),
      total,
    };
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    return result ? TaskMapper.toDomain(result) : null;
  }

  async update(task: Task): Promise<Task> {
    const ormEntity = TaskMapper.toOrm(task);
    const updated = await this.repo.save(ormEntity);
    return TaskMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}