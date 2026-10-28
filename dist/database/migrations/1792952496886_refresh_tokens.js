export async function up(db) {
    await db.schema.createTable('refresh_tokens')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'integer', (col) => col.notNull()
        .references('users.id')
        .onDelete('cascade'))
        .addColumn('token_hash', 'text', (col) => col.notNull())
        .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
        .addColumn('revoked_at', 'timestamptz')
        .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(new Date(Date.now())))
        .execute();
}
export async function down(db) {
    await db.schema.dropTable('refresh_tokens');
}
//# sourceMappingURL=1792952496886_refresh_tokens.js.map