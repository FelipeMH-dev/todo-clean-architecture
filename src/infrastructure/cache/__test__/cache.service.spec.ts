import { CacheService } from '../cache.service';

import { RedisService } from '../redis.service';
import { AppLogger } from '../../../shared/logger/logger.service';

describe('CacheService', () => {
  let service: CacheService;

  let redis: jest.Mocked<RedisService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    service = new CacheService(redis, logger);

    jest.clearAllMocks();
  });

  it('should log CACHE HIT when value exists', async () => {
    redis.get.mockResolvedValue('data');

    const result = await service.get('key-1');

    expect(redis.get).toHaveBeenCalledWith('key-1');

    expect(logger.log).toHaveBeenCalledWith(
      'CACHE HIT',
      expect.objectContaining({
        context: 'CacheService',
        extra: expect.objectContaining({
          key: 'key-1',
          hit: true,
        }),
      }),
    );

    expect(result).toBe('data');
  });

  it('should log CACHE MISS when value is null', async () => {
    redis.get.mockResolvedValue(null);

    const result = await service.get('key-1');

    expect(logger.log).toHaveBeenCalledWith(
      'CACHE MISS',
      expect.objectContaining({
        extra: expect.objectContaining({
          key: 'key-1',
          hit: false,
        }),
      }),
    );

    expect(result).toBeNull();
  });

  it('should set cache correctly', async () => {
    await service.set('key-1', { a: 1 }, 60);

    expect(redis.set).toHaveBeenCalledWith(
      'key-1',
      { a: 1 },
      60,
    );

    expect(logger.log).toHaveBeenCalledWith(
      'CACHE SET',
      expect.objectContaining({
        extra: {
          key: 'key-1',
          ttl: 60,
        },
      }),
    );
  });

  it('should delete cache key', async () => {
    await service.del('key-1');

    expect(redis.del).toHaveBeenCalledWith('key-1');

    expect(logger.warn).toHaveBeenCalledWith(
      'CACHE DEL',
      expect.objectContaining({
        extra: { key: 'key-1' },
      }),
    );
  });

  it('should invalidate all user task keys', async () => {
    redis.del.mockResolvedValue(undefined);

    await service.invalidateUserTasks('user-1');

    expect(redis.del).toHaveBeenCalledTimes(4);

    expect(redis.del).toHaveBeenCalledWith(
      'tasks:user-1:all',
    );

    expect(redis.del).toHaveBeenCalledWith(
      'tasks:user-1:pending',
    );

    expect(redis.del).toHaveBeenCalledWith(
      'tasks:user-1:in_progress',
    );

    expect(redis.del).toHaveBeenCalledWith(
      'tasks:user-1:done',
    );

    expect(logger.warn).toHaveBeenCalledWith(
      'CACHE INVALIDATION START',
      expect.any(Object),
    );

    expect(logger.warn).toHaveBeenCalledWith(
      'CACHE INVALIDATION DONE',
      expect.any(Object),
    );
  });

  it('should handle redis error silently in invalidate', async () => {
    redis.del.mockRejectedValue(new Error('Redis down'));

    await service.invalidateUserTasks('user-1');

    expect(logger.error).toHaveBeenCalledWith(
      'CACHE INVALIDATION ERROR',
      undefined,
      expect.any(Object),
    );
  });
});