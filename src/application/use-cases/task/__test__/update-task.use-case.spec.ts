import { UpdateTaskUseCase } from '../update-task.use-case';

import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { TaskRepository } from '../../../../domain/repositories/task.repository';
import { Task, TaskStatus } from '../../../../domain/entities/task.entity';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../../shared/logger/logger.service';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;

  let repo: jest.Mocked<TaskRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    cacheService = {
      invalidateUserTasks: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
    } as any;

    useCase = new UpdateTaskUseCase(repo, cacheService, logger);

    jest.clearAllMocks();
  });

  it('should throw NotFoundException when task does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'task-1', {
        title: 'new title',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(logger.warn).toHaveBeenCalledWith(
      'UPDATE TASK FAILED - NOT FOUND',
      expect.any(Object),
    );
  });

  it('should throw ForbiddenException when user does not own task', async () => {
    repo.findById.mockResolvedValue(
      new Task(
        'task-1',
        'other-user',
        'title',
        null,
        'pending',
        new Date(),
        new Date(),
      ),
    );

    await expect(
      useCase.execute('user-1', 'task-1', {
        title: 'new title',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(logger.warn).toHaveBeenCalledWith(
      'UPDATE TASK FORBIDDEN',
      expect.any(Object),
    );
  });

  it('should update task, persist changes, invalidate cache and return updated task', async () => {
    const existingTask = new Task(
      'task-1',
      'user-1',
      'old title',
      'old desc',
      'pending',
      new Date('2024-01-01'),
      new Date('2024-01-01'),
    );

    repo.findById.mockResolvedValue(existingTask);

    const updatedTask = new Task(
      'task-1',
      'user-1',
      'new title',
      'new desc',
      'done',
      existingTask.createdAt,
      new Date(),
    );

    repo.update.mockResolvedValue(updatedTask);

    const result = await useCase.execute('user-1', 'task-1', {
      title: 'new title',
      description: 'new desc',
      status: 'done' as TaskStatus,
    });

    // logs principales
    expect(logger.log).toHaveBeenCalledWith(
      'UPDATE TASK REQUEST',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'TASK AUTHORIZED FOR UPDATE',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'TASK ENTITY UPDATED IN MEMORY',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'TASK UPDATED IN DATABASE',
      expect.any(Object),
    );

    expect(logger.warn).toHaveBeenCalledWith(
      'CACHE INVALIDATED AFTER UPDATE',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'UPDATE TASK COMPLETED',
      expect.any(Object),
    );

    // repo calls
    expect(repo.findById).toHaveBeenCalledWith('task-1');
    expect(repo.update).toHaveBeenCalled();

    // cache
    expect(cacheService.invalidateUserTasks).toHaveBeenCalledWith(
      'user-1',
    );

    // result
    expect(result).toEqual(updatedTask);
  });
});