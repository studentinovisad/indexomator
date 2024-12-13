import { pgTable, serial, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { building } from './building';
import { department } from './department';
import { userTable } from './user';

export const employee = pgTable('employee', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	fname: text('fname').notNull(),
	lname: text('lname').notNull(),
	department: text('department')
		.notNull()
		.references(() => department.name, { onDelete: 'restrict' })
});

export const employeeEntry = pgTable(
	'employee_entry',
	{
		employeeId: integer('employee_id')
			.notNull()
			.references(() => employee.id, { onDelete: 'cascade' }),
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
			pk: primaryKey({ columns: [table.employeeId, table.timestamp] })
		};
	}
);
