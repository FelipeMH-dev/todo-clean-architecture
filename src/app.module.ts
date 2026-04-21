// filename: src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Módulos Clean Architecture
import { SharedModule } from './shared/shared.module';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { InterfacesModule } from './interfaces/interfaces.module';
import { LoggerModule } from './shared/logger/logger.module';
import { AppLogger } from './shared/logger/logger.service';
import { SecurityModule } from './shared/security/security.module';
import { databaseConfig } from './infrastructure/database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...databaseConfig(config),

        autoLoadEntities: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    SecurityModule,
    LoggerModule,
    SharedModule,
    ApplicationModule,
    InfrastructureModule,
    InterfacesModule,
  ],
  providers: [AppLogger],
})
export class AppModule { }