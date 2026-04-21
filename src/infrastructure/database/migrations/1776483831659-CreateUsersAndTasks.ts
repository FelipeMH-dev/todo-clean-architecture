import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndTasks1700000000001
  implements MigrationInterface
{
  name = 'CreateUsersAndTasks1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------
    // EXTENSION UUID
    // -------------------------------------------------
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);

    // -------------------------------------------------
    // TABLA USERS
    // -------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // -------------------------------------------------
    // TABLA TASKS
    // -------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        status varchar(20) NOT NULL,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL,

        CONSTRAINT fk_tasks_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    // -------------------------------------------------
    // ASEGURAR COLUMNAS USERS
    // -------------------------------------------------
    const userColumns: Array<[string, string]> = [
      ['email', 'varchar(255)'],
      ['password', 'varchar(255)'],
      ['created_at', 'timestamptz DEFAULT now()'],
      ['updated_at', 'timestamptz DEFAULT now()'],
    ];

    for (const [name, type] of userColumns) {
      await queryRunner.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS ${name} ${type};
      `);
    }

    // -------------------------------------------------
    // ASEGURAR COLUMNAS TASKS
    // -------------------------------------------------
    const taskColumns: Array<[string, string]> = [
      ['user_id', 'uuid'],
      ['title', 'varchar(255)'],
      ['description', 'text'],
      ['status', 'varchar(20)'],
      ['created_at', 'timestamptz'],
      ['updated_at', 'timestamptz'],
    ];

    for (const [name, type] of taskColumns) {
      await queryRunner.query(`
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS ${name} ${type};
      `);
    }

    // -------------------------------------------------
    // ÍNDICES
    // -------------------------------------------------
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id
      ON tasks (user_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status
      ON tasks (status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------
    // ELIMINAR ÍNDICES
    // -------------------------------------------------
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tasks_status;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tasks_user_id;
    `);

    // -------------------------------------------------
    // ELIMINAR TABLAS
    // -------------------------------------------------
    await queryRunner.query(`
      DROP TABLE IF EXISTS tasks;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS users;
    `);
  }
}