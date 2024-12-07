import { pgTable, serial, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

// Student
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

// Employee
export const employee = pgTable('employee', {
	id: serial('id').primaryKey(),
	fname: text('fname').notNull(),
	lname: text('lname').notNull(),
	personal_id: text('personalid').notNull().unique()
});

export const employeeEntry = pgTable(
	'employee_entry',
	{
		employeeId: integer('employee_id')
			.notNull()
			.references(() => employee.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.employeeId, table.timestamp] })
		};
	}
);

export const employeeExit = pgTable(
	'employee_exit',
	{
		employeeId: integer('employee_id')
			.notNull()
			.references(() => employee.id, { onDelete: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.employeeId, table.timestamp] })
		};
	}
);
