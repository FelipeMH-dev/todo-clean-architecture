import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskOrmEntity } from './database/entities/task.orm-entity';
import { UserOrmEntity } from './database/entities/user.orm-entity';

import { TaskRepository } from '../domain/repositories/task.repository';
import { UserRepository } from '../domain/repositories/user.repository';

import { TaskRepositoryImpl } from './repositories/task.repository.impl';
import { UserRepositoryImpl } from './repositories/user.repository.impl';

import { CacheService } from './cache/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskOrmEntity,
      UserOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: TaskRepository,
      useClass: TaskRepositoryImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    CacheService,
  ],
  exports: [
    {
      provide: TaskRepository,
      useClass: TaskRepositoryImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    CacheService,
  ],
})
export class InfrastructureModule {}