import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';

import { TaskController } from './controllers/task.controller';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    TaskController,
    AuthController,
  ],
})
export class InterfacesModule {}