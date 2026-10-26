import { defineConfig } from 'kysely-ctl';
import { PostgresDialect, PostgresDialectConfig } from 'kysely';
import { Pool } from 'pg';

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      user: process.env.PG_USER,
      password: process.env.PG_USER_PASS,
      database: process.env.PG_DB,
    })as unknown as PostgresDialectConfig['pool'],
  }),
  migrations: {
    migrationFolder: 'src/database/migrations',
  },
});
