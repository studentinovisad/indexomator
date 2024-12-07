import { pgTable, serial, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const student = pgTable('student', {
	id: serial('id').primaryKey(),
	fname: text('fname').notNull(),
	lname: text('lname').notNull(),
	index: text('index').notNull().unique()
});

export const studentEntry = pgTable(
	'student_entry',
	{
		studentId: integer('student_id')
			.notNull()
			.references(() => student.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull()
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
		timestamp: timestamp('timestamp').defaultNow().notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.studentId, table.timestamp] })
		};
	}
);
