import { Global, Module } from '@nestjs/common';
import { RedisService } from '../infrastructure/cache/redis.service';
import { CacheService } from '../infrastructure/cache/cache.service';


@Global()
@Module({
  providers: [RedisService, CacheService],
  exports: [RedisService, CacheService],
})
export class SharedModule {}