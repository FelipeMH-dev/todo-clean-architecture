import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AppLogger } from '../../shared/logger/logger.service';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly TASK_KEYS = ['all', 'pending', 'in_progress', 'done'];

  constructor(
    private readonly redis: RedisService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    this.logger.log('CACHE INITIALIZED (RedisService direct)');
  }

  async get<T>(key: string): Promise<T | null> {
    const start = Date.now();

    const value = await this.redis.get<T>(key);

    const isHit = value !== null;

    this.logger.log(isHit ? 'CACHE HIT' : 'CACHE MISS', {
      context: 'CacheService',
      extra: {
        key,
        hit: isHit,
        timeMs: Date.now() - start,
      },
    });

    return value;
  }

  async set<T>(key: string, value: T, ttl: number) {
    await this.redis.set(key, value, ttl);

    this.logger.log('CACHE SET', {
      context: 'CacheService',
      extra: { key, ttl },
    });
  }

  async del(key: string) {
    await this.redis.del(key);

    this.logger.warn('CACHE DEL', {
      context: 'CacheService',
      extra: { key },
    });
  }

  async invalidateUserTasks(userId: string) {
  this.logger.warn('CACHE INVALIDATION START', {
    context: 'CacheService',
    extra: {
      userId,
      keys: this.TASK_KEYS.map(
        (k) => `tasks:${userId}:${k}`,
      ),
    },
  });

  const start = Date.now();

  await Promise.all(
    this.TASK_KEYS.map(async (k) => {
      const key = `tasks:${userId}:${k}`;

      try {
        await this.redis.del(key);

        this.logger.warn('CACHE KEY DELETED', {
          context: 'CacheService',
          extra: { key },
        });
      } catch (error) {
        this.logger.error('CACHE INVALIDATION ERROR', undefined, {
          context: 'CacheService',
          extra: { key, error },
        });
      }
    }),
  );

  this.logger.warn('CACHE INVALIDATION DONE', {
    context: 'CacheService',
    extra: {
      userId,
      timeMs: Date.now() - start,
    },
  });
}
}