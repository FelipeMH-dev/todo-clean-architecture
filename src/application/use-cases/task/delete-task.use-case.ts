import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { TaskRepository } from '../../../domain/repositories/task.repository';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../shared/logger/logger.service';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    private readonly repo: TaskRepository,
    private readonly cacheService: CacheService,
    private readonly logger: AppLogger,
  ) {}

async execute(
  userId: string,
  taskId: string,
): Promise<{ message: string; taskId: string }> {
  this.logger.log('DELETE TASK REQUEST', {
    context: 'DeleteTaskUseCase',
    extra: { userId, taskId },
  });

  const start = Date.now();

  const task = await this.repo.findById(taskId);

  if (!task) {
    this.logger.warn('DELETE TASK FAILED - NOT FOUND', {
      context: 'DeleteTaskUseCase',
      extra: { taskId },
    });

    throw new NotFoundException('Task not found');
  }

  if (task.userId !== userId) {
    this.logger.warn('DELETE TASK FORBIDDEN', {
      context: 'DeleteTaskUseCase',
      extra: {
        userId,
        taskOwner: task.userId,
        taskId,
      },
    });

    throw new ForbiddenException('Not your task');
  }

  await this.repo.delete(taskId);

  this.logger.log('TASK DELETED FROM DATABASE', {
    context: 'DeleteTaskUseCase',
    extra: {
      taskId,
      timeMs: Date.now() - start,
    },
  });

  await this.cacheService.invalidateUserTasks(userId);

  this.logger.warn('CACHE INVALIDATED AFTER DELETE', {
    context: 'DeleteTaskUseCase',
    extra: { userId, taskId },
  });

  this.logger.log('DELETE TASK COMPLETED', {
    context: 'DeleteTaskUseCase',
    extra: {
      taskId,
      totalTimeMs: Date.now() - start,
    },
  });

  return {
    message: 'Task deleted successfully',
    taskId,
  };
}
}