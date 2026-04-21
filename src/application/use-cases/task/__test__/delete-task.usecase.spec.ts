import { DeleteTaskUseCase } from '../delete-task.use-case';

import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { TaskRepository } from '../../../../domain/repositories/task.repository';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../../shared/logger/logger.service';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;

  let repo: jest.Mocked<TaskRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    cacheService = {
      invalidateUserTasks: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
    } as any;

    useCase = new DeleteTaskUseCase(repo, cacheService, logger);

    jest.clearAllMocks();
  });

  it('should throw NotFoundException when task does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'task-1'),
    ).rejects.toThrow(NotFoundException);

    expect(logger.warn).toHaveBeenCalledWith(
      'DELETE TASK FAILED - NOT FOUND',
      expect.any(Object),
    );
  });

  it('should throw ForbiddenException when task does not belong to user', async () => {
    repo.findById.mockResolvedValue({
      id: 'task-1',
      userId: 'other-user',
    } as any);

    await expect(
      useCase.execute('user-1', 'task-1'),
    ).rejects.toThrow(ForbiddenException);

    expect(logger.warn).toHaveBeenCalledWith(
      'DELETE TASK FORBIDDEN',
      expect.any(Object),
    );
  });

  it('should delete task, invalidate cache and return success message', async () => {
    repo.findById.mockResolvedValue({
      id: 'task-1',
      userId: 'user-1',
    } as any);

    repo.delete.mockResolvedValue(undefined);

    const result = await useCase.execute('user-1', 'task-1');

    // logs principales
    expect(logger.log).toHaveBeenCalledWith(
      'DELETE TASK REQUEST',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'TASK DELETED FROM DATABASE',
      expect.any(Object),
    );

    expect(logger.warn).toHaveBeenCalledWith(
      'CACHE INVALIDATED AFTER DELETE',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'DELETE TASK COMPLETED',
      expect.any(Object),
    );

    // repo calls
    expect(repo.findById).toHaveBeenCalledWith('task-1');
    expect(repo.delete).toHaveBeenCalledWith('task-1');

    // cache
    expect(cacheService.invalidateUserTasks).toHaveBeenCalledWith('user-1');

    // response
    expect(result).toEqual({
      message: 'Task deleted successfully',
      taskId: 'task-1',
    });
  });
});