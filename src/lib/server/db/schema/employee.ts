import { pgTable, serial, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const employee = pgTable('employee', {
	id: serial('id').primaryKey(),
	fname: text('fname').notNull(),
	lname: text('lname').notNull()
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
