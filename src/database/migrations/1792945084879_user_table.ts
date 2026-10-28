import type { Kysely } from 'kysely'
import { create } from 'node:domain';
import { Generated } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
 await db.schema
   .createTable("users")
   .addColumn("id", 'serial', (col) => col.primaryKey())
   .addColumn("name", 'text')
   .addColumn("email", 'text')
   .addColumn("password", 'text', (col) => col.notNull())
   .addColumn("login", 'text', (col) => col.notNull())
   .addColumn("description", 'text')
   .addColumn("age", 'integer')
   .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
