import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const university = pgTable('university', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique()
});
