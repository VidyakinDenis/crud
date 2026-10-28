export async function up(db) {
    await db.schema
        .alterTable('users')
        .addColumn('deleted', 'boolean', (col) => col.notNull().defaultTo(false))
        .execute();
}
export async function down(db) {
    await db.schema
        .alterTable('users')
        .dropColumn('deleted')
        .execute();
}
//# sourceMappingURL=1793023999286_soft_delete_user.js.map