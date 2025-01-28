import { pgTable, serial, integer, text, timestamp, primaryKey, unique } from 'drizzle-orm/pg-core';
import { department } from './department';
import { university } from './university';
import { building } from './building';
import { userTable } from './user';

export const person = pgTable(
	'person',
	{
		id: serial('id').primaryKey(),
		identifier: text('identifier').notNull(),
		type: text('type').notNull(),
		fname: text('fname').notNull(),
		lname: text('lname').notNull(),
		department: text('department').references(() => department.name, {
			onDelete: 'restrict',
			onUpdate: 'cascade'
		}),
		university: text('university').references(() => university.name, {
			onDelete: 'restrict',
			onUpdate: 'cascade'
		})
	},
	(table) => ({
		identifierUniversity: unique('person_identifier_university_id_unique')
			.on(table.identifier, table.university)
			.nullsNotDistinct()
	})
);

export const personEntry = pgTable(
	'person_entry',
	{
		personId: integer('person_id')
			.notNull()
			.references(() => person.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull(),
		building: text('building')
			.notNull()
			.references(() => building.name, { onDelete: 'restrict', onUpdate: 'cascade' }),
		creator: text('creator').references(() => userTable.username, {
			onDelete: 'no action',
			onUpdate: 'cascade'
		}),
		guarantorId: integer('guarantor_id').references(() => person.id, {
			onDelete: 'restrict',
			onUpdate: 'cascade'
		})
	},
	(table) => ({
		pk: primaryKey({ columns: [table.personId, table.timestamp] })
	})
);

export const personExit = pgTable(
	'person_exit',
	{
		personId: integer('person_id')
			.notNull()
			.references(() => person.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		timestamp: timestamp('timestamp').defaultNow().notNull(),
		building: text('building')
			.notNull()
			.references(() => building.name, { onDelete: 'restrict', onUpdate: 'cascade' }),
		creator: text('creator').references(() => userTable.username, {
			onDelete: 'no action',
			onUpdate: 'cascade'
		})
	},
	(table) => ({
		pk: primaryKey({ columns: [table.personId, table.timestamp] })
	})
);
