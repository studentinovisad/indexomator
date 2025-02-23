import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from './user';
import { building } from './building';

export const sessionTable = pgTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => userTable.id),
	building: text('building')
		.notNull()
		.references(() => building.name),
	timestamp: timestamp('timestamp').defaultNow().notNull()
});

export const adminSessionTable = pgTable('admin_session', {
	id: text('id').primaryKey(),
	timestamp: timestamp('timestamp').defaultNow().notNull()
});
