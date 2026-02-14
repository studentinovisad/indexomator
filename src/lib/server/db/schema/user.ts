import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	disabled: boolean('disabled').default(false).notNull()
});

export const ratelimitTable = pgTable(
	'ratelimit',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull(),
		lock: boolean('lock').notNull()
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.timestamp] })
	})
);

export const shiftTable = pgTable(
	'shift',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		start: timestamp('start').notNull(),
		end: timestamp('end').notNull()
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.start, table.end] })
	})
);
