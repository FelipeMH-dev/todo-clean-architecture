import { GetTasksUseCase } from '../get-tasks.use-case';

import { TaskRepository } from '../../../../domain/repositories/task.repository';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { AppLogger } from '../../../../shared/logger/logger.service';
import { Task, TaskStatus } from '../../../../domain/entities/task.entity';

describe('GetTasksUseCase', () => {
  let useCase: GetTasksUseCase;

  let repo: jest.Mocked<TaskRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    repo = {
      findByUserWithCount: jest.fn(),
    } as any;

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
    } as any;

    useCase = new GetTasksUseCase(repo, cacheService, logger);

    jest.clearAllMocks();
  });

  it('should return cached paginated tasks if cache exists', async () => {
    const cached = {
      data: [
        new Task(
          '1',
          'user-1',
          'Cached Task',
          null,
          'pending',
          new Date(),
          new Date(),
        ),
      ],
      page: 1,
      limit: 10,
      total: 1,
    };

    cacheService.get.mockResolvedValue(cached);

    const result = await useCase.execute('user-1', undefined, 1, 10);

    expect(cacheService.get).toHaveBeenCalledWith(
      'tasks:user-1:all:p1:l10',
    );

    expect(repo.findByUserWithCount).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it('should fetch from DB and cache result when cache is empty', async () => {
    cacheService.get.mockResolvedValue(null);

    const dbTasks: Task[] = [
      new Task(
        '2',
        'user-1',
        'DB Task',
        'desc',
        'in_progress',
        new Date(),
        new Date(),
      ),
    ];

    repo.findByUserWithCount.mockResolvedValue({
      data: dbTasks,
      total: 1,
    });

    const result = await useCase.execute('user-1', undefined, 1, 10);

    expect(repo.findByUserWithCount).toHaveBeenCalledWith(
      'user-1',
      undefined,
      { skip: 0, take: 10 },
    );

    expect(cacheService.set).toHaveBeenCalledWith(
      'tasks:user-1:all:p1:l10',
      {
        data: dbTasks,
        page: 1,
        limit: 10,
        total: 1,
      },
      60,
    );

    expect(result).toEqual({
      data: dbTasks,
      page: 1,
      limit: 10,
      total: 1,
    });
  });

  it('should apply status filter correctly', async () => {
    cacheService.get.mockResolvedValue(null);

    repo.findByUserWithCount.mockResolvedValue({
      data: [],
      total: 0,
    });

    await useCase.execute('user-1', 'done' as TaskStatus, 1, 10);

    expect(cacheService.get).toHaveBeenCalledWith(
      'tasks:user-1:done:p1:l10',
    );

    expect(repo.findByUserWithCount).toHaveBeenCalledWith(
      'user-1',
      'done',
      { skip: 0, take: 10 },
    );
  });
});