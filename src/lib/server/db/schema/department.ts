import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const department = pgTable('department', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique()
});
