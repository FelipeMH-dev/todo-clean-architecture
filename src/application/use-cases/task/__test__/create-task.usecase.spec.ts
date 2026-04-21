import { CreateTaskUseCase } from '../create-task.use-case';
import { BadRequestException } from '@nestjs/common';
import { TaskRepository } from '../../../../domain/repositories/task.repository';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { Task } from '../../../../domain/entities/task.entity';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;

  let repo: jest.Mocked<TaskRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let logger: jest.Mocked<AppLogger>;

  const { v4: uuid } = require('uuid');

  beforeEach(() => {
    repo = {
      create: jest.fn(),
    } as any;

    cacheService = {
      invalidateUserTasks: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
    } as any;

    useCase = new CreateTaskUseCase(repo, cacheService, logger);

    jest.clearAllMocks();
  });

  it('should throw BadRequestException when title is empty', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        title: '   ',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(logger.warn).toHaveBeenCalledWith(
      'CREATE TASK VALIDATION FAILED',
      expect.any(Object),
    );
  });

  it('should create task, save it, invalidate cache and return task', async () => {
    uuid.mockReturnValue('task-123');

    const fakeTask = new Task(
      'task-123',
      'user-1',
      'My Task',
      null,
      'pending',
      new Date(),
      new Date(),
    );

    repo.create.mockResolvedValue(fakeTask);

    const result = await useCase.execute({
      userId: 'user-1',
      title: ' My Task ',
      description: ' desc ',
    });

    // logs iniciales
    expect(logger.log).toHaveBeenCalledWith(
      'CREATE TASK REQUEST',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'TASK ENTITY CREATED',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'TASK SAVED IN DATABASE',
      expect.any(Object),
    );

    expect(logger.warn).toHaveBeenCalledWith(
      'CACHE INVALIDATED AFTER CREATE',
      expect.any(Object),
    );

    expect(logger.log).toHaveBeenCalledWith(
      'CREATE TASK COMPLETED',
      expect.any(Object),
    );

    // repo
    expect(repo.create).toHaveBeenCalled();

    // cache
    expect(cacheService.invalidateUserTasks).toHaveBeenCalledWith('user-1');

    // result
    expect(result).toEqual(fakeTask);
  });
});