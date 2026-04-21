import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../shared/logger/logger.service';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    private readonly repo: TaskRepository,
    private readonly cacheService: CacheService,
    private readonly logger: AppLogger,
  ) {}

  async execute(
    userId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
    },
  ): Promise<Task> {

    this.logger.log('UPDATE TASK REQUEST', {
      context: 'UpdateTaskUseCase',
      extra: {
        userId,
        taskId,
        data,
      },
    });

    const start = Date.now();


    const task = await this.repo.findById(taskId);

    if (!task) {
      this.logger.warn('UPDATE TASK FAILED - NOT FOUND', {
        context: 'UpdateTaskUseCase',
        extra: { taskId },
      });

      throw new NotFoundException('Task not found');
    }


    if (task.userId !== userId) {
      this.logger.warn('UPDATE TASK FORBIDDEN', {
        context: 'UpdateTaskUseCase',
        extra: {
          userId,
          taskOwner: task.userId,
          taskId,
        },
      });

      throw new ForbiddenException('Not your task');
    }

    this.logger.log('TASK AUTHORIZED FOR UPDATE', {
      context: 'UpdateTaskUseCase',
      extra: {
        taskId,
        userId,
      },
    });

    const updatedTask = new Task(
      task.id,
      task.userId,
      data.title ?? task.title,
      data.description ?? task.description,
      data.status ?? task.status,
      task.createdAt,
      new Date(),
    );

    this.logger.log('TASK ENTITY UPDATED IN MEMORY', {
      context: 'UpdateTaskUseCase',
      extra: {
        taskId,
        changes: data,
      },
    });

  
    const result = await this.repo.update(updatedTask);

    this.logger.log('TASK UPDATED IN DATABASE', {
      context: 'UpdateTaskUseCase',
      extra: {
        taskId,
        timeMs: Date.now() - start,
      },
    });


    await this.cacheService.invalidateUserTasks(userId);

    this.logger.warn('CACHE INVALIDATED AFTER UPDATE', {
      context: 'UpdateTaskUseCase',
      extra: {
        userId,
        taskId,
      },
    });

    this.logger.log('UPDATE TASK COMPLETED', {
      context: 'UpdateTaskUseCase',
      extra: {
        taskId,
        totalTimeMs: Date.now() - start,
      },
    });

    return result;
  }
}