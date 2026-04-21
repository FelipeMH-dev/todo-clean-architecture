jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task.controller';

import { CreateTaskUseCase } from '../../../application/use-cases/task/create-task.use-case';
import { GetTasksUseCase } from '../../../application/use-cases/task/get-tasks.use-case';
import { UpdateTaskUseCase } from '../../../application/use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from '../../../application/use-cases/task/delete-task.use-case';

import { UpdateTaskDto } from '../../dtos/update-task.dto';
import { TaskStatus } from '../../../domain/entities/task.entity';

describe('TaskController', () => {
  let controller: TaskController;

  const createTaskMock = { execute: jest.fn() };
  const getTasksMock = { execute: jest.fn() };
  const updateTaskMock = { execute: jest.fn() };
  const deleteTaskMock = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: CreateTaskUseCase, useValue: createTaskMock },
        { provide: GetTasksUseCase, useValue: getTasksMock },
        { provide: UpdateTaskUseCase, useValue: updateTaskMock },
        { provide: DeleteTaskUseCase, useValue: deleteTaskMock },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);

    jest.clearAllMocks();
  });

  it('should create a task', async () => {
    const user = { id: 'user-1', email: 'test@mail.com' };

    const dto = {
      title: 'Task 1',
      description: 'desc',
    };

    const expected = {
      id: 'test-uuid',
      userId: 'user-1',
      title: 'Task 1',
    };

    createTaskMock.execute.mockResolvedValue(expected);

    const result = await controller.create(user as any, dto);

    expect(createTaskMock.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      title: 'Task 1',
      description: 'desc',
    });

    expect(result).toEqual(expected);
  });

  it('should get tasks by user', async () => {
    const user = { id: 'user-1', email: 'test@mail.com' };

    const tasks = [{ id: 't1' }, { id: 't2' }];

    getTasksMock.execute.mockResolvedValue(tasks);

    const query = {
      status: 'pending',
      page: 1,
      limit: 10,
    };

    const result = await controller.find(user as any, query as any);

    expect(getTasksMock.execute).toHaveBeenCalledWith(
      'user-1',
      'pending',
      1,
      10,
    );

    expect(result).toEqual(tasks);
  });

  it('should update a task', async () => {
    const user = { id: 'user-1', email: 'test@mail.com' };

    const dto: UpdateTaskDto = {
      title: 'Updated Task',
      status: 'done' as TaskStatus,
    };

    const updated = {
      id: 'task-1',
      title: 'Updated Task',
      status: 'done',
    };

    updateTaskMock.execute.mockResolvedValue(updated);

    const result = await controller.update(user as any, 'task-1', dto);

    expect(updateTaskMock.execute).toHaveBeenCalledWith(
      'user-1',
      'task-1',
      dto,
    );

    expect(result).toEqual(updated);
  });

  it('should delete a task', async () => {
    const user = { id: 'user-1', email: 'test@mail.com' };

    const response = {
      message: 'Task deleted successfully',
      taskId: 'task-1',
    };

    deleteTaskMock.execute.mockResolvedValue(response);

    const result = await controller.delete(user as any, 'task-1');

    expect(deleteTaskMock.execute).toHaveBeenCalledWith(
      'user-1',
      'task-1',
    );

    expect(result).toEqual(response);
  });
});