import { Injectable, BadRequestException } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Task } from '../../../domain/entities/task.entity';
import { v4 as uuid } from 'uuid';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../shared/logger/logger.service';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly repo: TaskRepository,
    private readonly cacheService: CacheService,
    private readonly logger: AppLogger,
  ) {}

  async execute(data: {
    userId: string;
    title: string;
    description?: string;
  }): Promise<Task> {

    this.logger.log('CREATE TASK REQUEST', {
      context: 'CreateTaskUseCase',
      extra: {
        userId: data.userId,
        title: data.title,
      },
    });

    const start = Date.now();

    const title = data.title?.trim();

    if (!title) {
      this.logger.warn('CREATE TASK VALIDATION FAILED', {
        context: 'CreateTaskUseCase',
        extra: {
          reason: 'title is empty',
          userId: data.userId,
        },
      });

      throw new BadRequestException('Title is required');
    }

    const now = new Date();

    const task = new Task(
      uuid(),
      data.userId,
      title,
      data.description?.trim() || null,
      'pending',
      now,
      now,
    );

    this.logger.log('TASK ENTITY CREATED', {
      context: 'CreateTaskUseCase',
      extra: {
        taskId: task.id,
        userId: task.userId,
        status: task.status,
      },
    });

    const created = await this.repo.create(task);

    this.logger.log('TASK SAVED IN DATABASE', {
      context: 'CreateTaskUseCase',
      extra: {
        taskId: created.id,
        timeMs: Date.now() - start,
      },
    });

    await this.cacheService.invalidateUserTasks(data.userId);

    this.logger.warn('CACHE INVALIDATED AFTER CREATE', {
      context: 'CreateTaskUseCase',
      extra: {
        userId: data.userId,
        taskId: created.id,
      },
    });

    this.logger.log('CREATE TASK COMPLETED', {
      context: 'CreateTaskUseCase',
      extra: {
        taskId: created.id,
        totalTimeMs: Date.now() - start,
      },
    });

    return created;
  }
}