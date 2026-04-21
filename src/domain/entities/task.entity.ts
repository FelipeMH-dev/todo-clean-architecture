export type TaskStatus = 'pending' | 'in_progress' | 'done';

export class Task {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}