import AppDataSource from '../infrastructure/database/typeorm-cli.datasource';

async function run() {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
}

run();