import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { TaskOrmEntity } from './entities/task.orm-entity';
import { UserOrmEntity } from './entities/user.orm-entity';
import * as dotenv from 'dotenv';
dotenv.config();
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'postgres',
  entities: [TaskOrmEntity, UserOrmEntity],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;