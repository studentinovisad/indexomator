import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const building = pgTable('building', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique()
});
