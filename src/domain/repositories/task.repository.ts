import { Task, TaskStatus } from '../entities/task.entity';

export interface FindByUserOptions {
  skip?: number;
  take?: number;
}

export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>;

 abstract findByUserWithCount(
    userId: string,
    status?: TaskStatus,
    options?: FindByUserOptions,
  ): Promise<{ data: Task[]; total: number }>;


  abstract findById(id: string): Promise<Task | null>;

  abstract update(task: Task): Promise<Task>;

  abstract delete(id: string): Promise<void>;
}