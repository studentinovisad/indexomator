import { pgTable, serial, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { building } from './building';
import { department } from './department';
import { userTable } from './user';

export const student = pgTable('student', {
	id: serial('id').primaryKey(),
	index: text('index').notNull().unique(),
	fname: text('fname').notNull(),
	lname: text('lname').notNull(),
	department: text('department')
		.notNull()
		.references(() => department.name, { onDelete: 'restrict' })
});

export const studentEntry = pgTable(
	'student_entry',
	{
		studentId: integer('student_id')
			.notNull()
			.references(() => student.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull(),
		building: text('building')
			.notNull()
			.references(() => building.name, { onDelete: 'restrict' }),
		creator: text('creator')
			.notNull()
			.references(() => userTable.username, { onDelete: 'no action' })
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.studentId, table.timestamp] })
		};
	}
);

export const studentExit = pgTable(
	'student_exit',
	{
		studentId: integer('student_id')
			.notNull()
			.references(() => student.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull(),
		building: text('building')
			.notNull()
			.references(() => building.name, { onDelete: 'restrict' }),
		creator: text('creator')
			.notNull()
			.references(() => userTable.username, { onDelete: 'no action' })
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.studentId, table.timestamp] })
		};
	}
);
