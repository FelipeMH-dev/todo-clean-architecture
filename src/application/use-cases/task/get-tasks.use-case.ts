import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { AppLogger } from '../../../shared/logger/logger.service';

import { Task, TaskStatus } from '../../../domain/entities/task.entity';
import { CacheService } from '../../../infrastructure/cache/cache.service';

export interface PaginatedTasks {
  data: Task[];
  page: number;
  limit: number;
  total: number;
}

@Injectable()
export class GetTasksUseCase {
  private readonly TTL = 60;

  constructor(
    private readonly repo: TaskRepository,
    private readonly cacheService: CacheService,
    private readonly logger: AppLogger,
  ) {}

  async execute(
    userId: string,
    status?: TaskStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedTasks> {
    const usePagination = page !== undefined || limit !== undefined;

    const finalPage = page ?? 1;
    const finalLimit = limit ?? 10;

    const skip = usePagination ? (finalPage - 1) * finalLimit : undefined;
    const take = usePagination ? finalLimit : undefined;

    const key = this.buildCacheKey(
      userId,
      status,
      usePagination ? finalPage : 'all',
      usePagination ? finalLimit : 'all',
    );

    const cached = await this.cacheService.get<PaginatedTasks>(key);

    if (cached) return cached;

    const dbStart = Date.now();

    const { data, total } = await this.repo.findByUserWithCount(
      userId,
      status,
      { skip, take },
    );

    this.logger.log('DB QUERY EXECUTED', {
      context: 'GetTasksUseCase',
      extra: {
        timeMs: Date.now() - dbStart,
        total,
        count: data.length,
      },
    });

    const response: PaginatedTasks = {
      data,
      page: finalPage,
      limit: finalLimit,
      total,
    };

    await this.cacheService.set(key, response, this.TTL);

    return response;
  }

  private buildCacheKey(
    userId: string,
    status?: TaskStatus,
    page?: number | string,
    limit?: number | string,
  ): string {
    return `tasks:${userId}:${status ?? 'all'}:p${page}:l${limit}`;
  }
}