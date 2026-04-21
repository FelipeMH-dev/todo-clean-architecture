import { TaskMapper } from '../task.mapper';
import { Task } from './../../../domain/entities/task.entity';
import { TaskStatus } from '../../../domain/entities/task.entity';
import { TaskOrmEntity } from '../../database/entities/task.orm-entity';

describe('TaskMapper', () => {
  const now = new Date();

  describe('toOrm', () => {
    it('should map domain Task to ORM entity correctly', () => {
      const task = new Task(
        'task-id',
        'user-id',
        'Test title',
        'Test description',
        'pending' as TaskStatus,
        now,
        now,
      );

      const result = TaskMapper.toOrm(task);

      expect(result).toBeInstanceOf(TaskOrmEntity);
      expect(result.id).toBe('task-id');
      expect(result.title).toBe('Test title');
      expect(result.description).toBe('Test description');
      expect(result.status).toBe('pending');
      expect(result.user.id).toBe('user-id');
      expect(result.createdAt).toBe(now);
      expect(result.updatedAt).toBe(now);
    });

    it('should handle null description', () => {
      const task = new Task(
        'task-id',
        'user-id',
        'Title',
        null,
        'done' as TaskStatus,
        now,
        now,
      );

      const result = TaskMapper.toOrm(task);

      expect(result.description).toBeNull();
    });
  });

  describe('toDomain', () => {
    it('should map ORM entity to domain Task correctly', () => {
      const orm = new TaskOrmEntity();

      orm.id = 'task-id';
      orm.title = 'Title';
      orm.description = 'Description';
      orm.status = 'in_progress' as TaskStatus;
      orm.createdAt = now;
      orm.updatedAt = now;
      orm.user = { id: 'user-id' } as any;

      const result = TaskMapper.toDomain(orm);

      expect(result).toBeInstanceOf(Task);
      expect(result.id).toBe('task-id');
      expect(result.userId).toBe('user-id');
      expect(result.title).toBe('Title');
      expect(result.description).toBe('Description');
      expect(result.status).toBe('in_progress');
      expect(result.createdAt).toBe(now);
      expect(result.updatedAt).toBe(now);
    });

    it('should handle undefined user safely', () => {
      const orm = new TaskOrmEntity();

      orm.id = 'task-id';
      orm.title = 'Title';
      orm.description = null;
      orm.status = 'pending' as TaskStatus;
      orm.createdAt = now;
      orm.updatedAt = now;
      orm.user = undefined as any;

      const result = TaskMapper.toDomain(orm);

      expect(result.userId).toBeUndefined();
    });
  });
});