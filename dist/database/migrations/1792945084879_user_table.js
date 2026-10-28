export async function up(db) {
    await db.schema
        .createTable("users")
        .addColumn("id", 'serial', (col) => col.primaryKey())
        .addColumn("name", 'text')
        .addColumn("email", 'text')
        .addColumn("password", 'text', (col) => col.notNull())
        .addColumn("login", 'text', (col) => col.notNull())
        .addColumn("description", 'text')
        .addColumn("age", 'integer')
        .execute();
}
export async function down(db) {
    await db.schema.dropTable("users").execute();
}
//# sourceMappingURL=1792945084879_user_table.js.map