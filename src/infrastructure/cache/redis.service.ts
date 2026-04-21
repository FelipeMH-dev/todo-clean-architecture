import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');

    this.client = new Redis({
      host: host || '127.0.0.1',
      port: port || 6379,
    });

    this.client.on('connect', () => {
      console.log('Redis conectado');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}