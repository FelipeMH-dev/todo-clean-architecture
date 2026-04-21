import { RedisService } from '../redis.service';
import { ConfigService } from '@nestjs/config';

describe('RedisService', () => {
  let service: RedisService;

  let configService: jest.Mocked<ConfigService>;

  let redisMock: any;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;

    service = new RedisService(configService);

    // 👇 FORZAMOS client mock DESPUÉS de instanciar
    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      on: jest.fn(),
    };

    (service as any).client = redisMock;
  });

  it('should return parsed JSON', async () => {
    redisMock.get.mockResolvedValue(JSON.stringify({ ok: true }));

    const result = await service.get('key');

    expect(result).toEqual({ ok: true });
  });

  it('should return null when no value', async () => {
    redisMock.get.mockResolvedValue(null);

    const result = await service.get('key');

    expect(result).toBeNull();
  });

  it('should set value with TTL', async () => {
    await service.set('key', { a: 1 }, 60);

    expect(redisMock.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify({ a: 1 }),
      'EX',
      60,
    );
  });

  it('should delete key', async () => {
    await service.del('key');

    expect(redisMock.del).toHaveBeenCalledWith('key');
  });
});