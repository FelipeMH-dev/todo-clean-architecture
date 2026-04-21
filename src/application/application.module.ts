import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

import { CreateTaskUseCase } from './use-cases/task/create-task.use-case';
import { GetTasksUseCase } from './use-cases/task/get-tasks.use-case';
import { UpdateTaskUseCase } from './use-cases/task/update-task.use-case';
import { DeleteTaskUseCase } from './use-cases/task/delete-task.use-case';

import { RegisterUseCase } from './use-cases/auth/register.use-case';
import { LoginUseCase } from './use-cases/auth/login.use-case';
import { SecurityModule } from '../shared/security/security.module';

@Module({
  imports: [
    InfrastructureModule,
    SecurityModule
  ],
  providers: [
    CreateTaskUseCase,
    GetTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,

    RegisterUseCase,
    LoginUseCase,
  ],
  exports: [

    CreateTaskUseCase,
    GetTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,

    RegisterUseCase,
    LoginUseCase,
  ],
})
export class ApplicationModule {}