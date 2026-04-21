import { ConfigService } from '@nestjs/config';
export const databaseConfig = (config: ConfigService) => ({
  type: 'postgres' as const,
  host: config.get('DB_HOST'),
  port: Number(config.get('DB_PORT')),
  username: config.get('DB_USER'),
  password: config.get('DB_PASSWORD'),
  database: config.get('DB_NAME'),
});