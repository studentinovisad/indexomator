import type { InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { student } from './student';

export const userTable = pgTable('user', {
	id: serial('id').primaryKey(),
	username: text('username')
		.notNull()
		.unique()
		.references(() => student.index, { onDelete: 'cascade' }),
	passwordHash: text('password_hash').notNull()
});

export type User = InferSelectModel<typeof userTable>;
