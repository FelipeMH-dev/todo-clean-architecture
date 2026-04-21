import { TaskRepositoryImpl } from '../task.repository.impl';
import { TaskOrmEntity } from '../../database/entities/task.orm-entity';
import { Repository } from 'typeorm';

import { TaskMapper } from '../../mappers/task.mapper';
import { Task, TaskStatus } from '../../../domain/entities/task.entity';

describe('TaskRepositoryImpl', () => {
  let repo: TaskRepositoryImpl;

  let typeormRepo: jest.Mocked<Repository<TaskOrmEntity>>;

  beforeEach(() => {
    typeormRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      findAndCount: jest.fn(), // 👈 NUEVO
    } as any;

    repo = new TaskRepositoryImpl(typeormRepo);

    jest.clearAllMocks();
  });

  it('should create a task', async () => {
    const domainTask = new Task(
      '1',
      'user-1',
      'title',
      null,
      'pending',
      new Date(),
      new Date(),
    );

    const ormTask = {} as TaskOrmEntity;
    const savedTask = {} as TaskOrmEntity;

    jest.spyOn(TaskMapper, 'toOrm').mockReturnValue(ormTask);
    jest.spyOn(TaskMapper, 'toDomain').mockReturnValue(domainTask);

    typeormRepo.save.mockResolvedValue(savedTask);

    const result = await repo.create(domainTask);

    expect(typeormRepo.save).toHaveBeenCalledWith(ormTask);
    expect(result).toEqual(domainTask);
  });

  it('should find tasks by user with count (no status)', async () => {
    const ormResult = [{} as TaskOrmEntity];

    typeormRepo.findAndCount.mockResolvedValue([ormResult, 1]);

    const domainTask = new Task(
      '1',
      'user-1',
      'title',
      null,
      'pending',
      new Date(),
      new Date(),
    );

    jest.spyOn(TaskMapper, 'toDomain').mockReturnValue(domainTask);

    const result = await repo.findByUserWithCount('user-1');

    expect(typeormRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user: { id: 'user-1' },
        },
        relations: ['user'],
        skip: undefined,
        take: undefined,
      }),
    );

    expect(result).toEqual({
      data: [domainTask],
      total: 1,
    });
  });

  it('should find tasks by user with status and pagination', async () => {
    typeormRepo.findAndCount.mockResolvedValue([[], 0]);

    await repo.findByUserWithCount('user-1', 'done' as TaskStatus, {
      skip: 0,
      take: 10,
    });

    expect(typeormRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user: { id: 'user-1' },
          status: 'done',
        },
        skip: 0,
        take: 10,
      }),
    );
  });

  it('should find task by id', async () => {
    const ormTask = {} as TaskOrmEntity;

    typeormRepo.findOne.mockResolvedValue(ormTask);

    const domainTask = new Task(
      '1',
      'user-1',
      'title',
      null,
      'pending',
      new Date(),
      new Date(),
    );

    jest.spyOn(TaskMapper, 'toDomain').mockReturnValue(domainTask);

    const result = await repo.findById('1');

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['user'],
    });

    expect(result).toEqual(domainTask);
  });

  it('should return null if task not found by id', async () => {
    typeormRepo.findOne.mockResolvedValue(null);

    const result = await repo.findById('1');

    expect(result).toBeNull();
  });

  it('should update task', async () => {
    const domainTask = new Task(
      '1',
      'user-1',
      'title',
      null,
      'pending',
      new Date(),
      new Date(),
    );

    const ormTask = {} as TaskOrmEntity;

    jest.spyOn(TaskMapper, 'toOrm').mockReturnValue(ormTask);
    jest.spyOn(TaskMapper, 'toDomain').mockReturnValue(domainTask);

    typeormRepo.save.mockResolvedValue(ormTask);

    const result = await repo.update(domainTask);

    expect(typeormRepo.save).toHaveBeenCalledWith(ormTask);
    expect(result).toEqual(domainTask);
  });

  it('should delete task by id', async () => {
    typeormRepo.delete.mockResolvedValue({} as any);

    await repo.delete('1');

    expect(typeormRepo.delete).toHaveBeenCalledWith({
      id: '1',
    });
  });
});