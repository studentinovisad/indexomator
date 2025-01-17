import type { InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	active: boolean('active').default(true).notNull()
});

export const ratelimitTable = pgTable('ratelimit', {
	userId: integer('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	timestamp: timestamp('timestamp').defaultNow().notNull(),
	lock: boolean('lock').notNull()
});

export type User = InferSelectModel<typeof userTable>;
