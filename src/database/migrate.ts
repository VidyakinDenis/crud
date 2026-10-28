import * as path from 'path'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import { Kysely, PostgresDialect, PostgresDialectConfig } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration'
import { Database } from './database.types.js'
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateToLatest() {
  const dialectConfig: PostgresDialectConfig = {
    pool: new Pool({
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      user: process.env.PG_USER,
      password: process.env.PG_USER_PASS,
      database: process.env.PG_DB,
    })as unknown as PostgresDialectConfig['pool'],
  };

  const db = new Kysely<Database>({
    dialect: new PostgresDialect(dialectConfig),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(dirname, 'migrations'),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()