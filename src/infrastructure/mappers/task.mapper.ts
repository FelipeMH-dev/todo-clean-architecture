import { Task } from '../../domain/entities/task.entity';
import { TaskOrmEntity } from '../database/entities/task.orm-entity';
import { UserOrmEntity } from '../database/entities/user.orm-entity';

export class TaskMapper {
  static toOrm(task: Task): TaskOrmEntity {
    const orm = new TaskOrmEntity();

    orm.id = task.id;
    orm.title = task.title;
    orm.description = task.description ?? null;
    orm.status = task.status;
    orm.user = { id: task.userId } as UserOrmEntity;

    orm.createdAt = task.createdAt;
    orm.updatedAt = task.updatedAt;

    return orm;
  }

  static toDomain(orm: TaskOrmEntity): Task {
    return new Task(
      orm.id,
      orm.user?.id,
      orm.title,
      orm.description,
      orm.status,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}