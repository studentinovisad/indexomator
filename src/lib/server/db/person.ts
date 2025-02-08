import type { Database } from './connect';
import {
	or,
	eq,
	and,
	max,
	gt,
	count,
	isNull,
	not,
	min,
	sql,
	sum,
	desc,
	lt,
	gte,
	aliasedTable
} from 'drizzle-orm';
import { person, personEntry, personExit } from './schema/person';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzysearch';
import { sqlConcat, sqlLeast, sqlLevenshteinDistance } from './utils';
import { isInside } from '../isInside';
import { capitalizeString, sanitizeString } from '$lib/utils/sanitize';
import { building } from './schema/building';
import {
	Employee,
	Guest,
	isPersonType,
	Student,
	type Person,
	type PersonLight,
	type PersonType
} from '$lib/types/person';
import { guarantorEligibilityHours } from '$lib/utils/env';
import { hoursSpentCutoffHours } from '$lib/server/env';
import { alias, QueryBuilder, type PgSelectQueryBuilder } from 'drizzle-orm/pg-core';

type searchOptions = {
	searchQuery?: string;
	guarantorSearch?: boolean;
};

// Gets all persons using optional filters
export async function getPersons(
	db: Database,
	limit: number,
	offset: number,
	opts: searchOptions = {}
): Promise<Person[]> {
	// Assert limit is valid
	if (limit <= 0) {
		throw new Error('Invalid limit (negative or zero)');
	}

	// Assert offset is valid
	if (offset < 0) {
		throw new Error('Invalid offset (negative)');
	}

	// Don't search if the search query is empty when trimmed
	const sanitizedSearchQuery = opts.searchQuery ? sanitizeString(opts.searchQuery) : undefined;
	const nonEmptySearchQuery = sanitizedSearchQuery
		? sanitizedSearchQuery !== ''
			? sanitizedSearchQuery
			: undefined
		: undefined;

	// Whether to search for persons that aren't of type "Guest" and are eligible (have enough hours spent)
	const guarantorSearch = opts.guarantorSearch ?? false;

	try {
		const guarantorTable = alias(person, 'guarantor');

		const maxEntrySubquery = db
			.select({
				personId: personEntry.personId,
				maxEntryTimestamp: max(personEntry.timestamp).as('max_entry_timestamp')
			})
			.from(personEntry)
			.groupBy(personEntry.personId)
			.as('max_entry_timestamp');

		const maxExitSubquery = db
			.select({
				personId: personExit.personId,
				maxExitTimestamp: max(personExit.timestamp).as('max_exit_timestamp')
			})
			.from(personExit)
			.groupBy(personExit.personId)
			.as('max_exit_timestamp');

		const timestampPairsSubquery = db
			.select({
				personId: personEntry.personId,
				entryTimestamp: personEntry.timestamp,
				exitTimestamp: min(personExit.timestamp).as('exit_timestamp')
			})
			.from(personEntry)
			.innerJoin(personExit, eq(personExit.personId, personEntry.personId))
			.where(gt(personExit.timestamp, personEntry.timestamp))
			.groupBy(personEntry.personId, personEntry.timestamp)
			.as('timestamp_pairs');
		const hoursSpentSubQuery = db
			.with(timestampPairsSubquery)
			.select({
				personId: timestampPairsSubquery.personId,
				hoursSpent: sql<number>`
					extract(epoch from (${timestampPairsSubquery.exitTimestamp} - ${timestampPairsSubquery.entryTimestamp})) / 3600`.as(
					'hours_spent'
				)
			})
			.from(timestampPairsSubquery)
			.as('hours_spent');
		const totalHoursSpentSubQuery = db
			.select({
				personId: hoursSpentSubQuery.personId,
				totalHoursSpent: sum(hoursSpentSubQuery.hoursSpent).mapWith(Number).as('total_hours_spent')
			})
			.from(hoursSpentSubQuery)
			.where(lt(hoursSpentSubQuery.hoursSpent, hoursSpentCutoffHours))
			.groupBy(hoursSpentSubQuery.personId)
			.as('total_hours_spent');

		const persons =
			nonEmptySearchQuery !== undefined
				? await db
						.select({
							id: person.id,
							identifier: person.identifier,
							type: person.type,
							fname: person.fname,
							lname: person.lname,
							department: person.department,
							university: person.university,
							entryTimestamp: maxEntrySubquery.maxEntryTimestamp,
							entryBuilding: personEntry.building,
							entryGuarantorId: personEntry.guarantorId,
							entryGuarantorFname: guarantorTable.fname,
							entryGuarantorLname: guarantorTable.lname,
							entryGuarantorIdentifier: guarantorTable.identifier,
							exitTimestamp: maxExitSubquery.maxExitTimestamp,
							totalHoursSpent: totalHoursSpentSubQuery.totalHoursSpent,
							leastDistance: sqlLeast([
								sqlLevenshteinDistance(sqlConcat([person.identifier]), nonEmptySearchQuery),
								sqlLevenshteinDistance(sqlConcat([person.fname]), nonEmptySearchQuery),
								sqlLevenshteinDistance(sqlConcat([person.lname]), nonEmptySearchQuery),
								sqlLevenshteinDistance(
									sqlConcat([person.fname, person.lname], ' '),
									nonEmptySearchQuery
								),
								sqlLevenshteinDistance(
									sqlConcat([person.lname, person.fname], ' '),
									nonEmptySearchQuery
								)
							]).as('least_distance'),
							leastDistanceIdentifier: sqlLevenshteinDistance(
								sqlConcat([person.identifier]),
								nonEmptySearchQuery
							).as('least_distance_identifier')
						})
						.from(person)
						.leftJoin(maxEntrySubquery, eq(maxEntrySubquery.personId, person.id))
						.leftJoin(maxExitSubquery, eq(maxExitSubquery.personId, person.id))
						.leftJoin(
							personEntry,
							and(
								eq(personEntry.personId, person.id),
								eq(personEntry.timestamp, maxEntrySubquery.maxEntryTimestamp)
							)
						)
						.leftJoin(guarantorTable, eq(guarantorTable.id, personEntry.guarantorId))
						// TODO: Don't left join when not guarantorSearch
						.leftJoin(totalHoursSpentSubQuery, eq(totalHoursSpentSubQuery.personId, person.id))
						.where(
							and(
								guarantorSearch
									? and(
											not(eq(person.type, Guest)),
											gte(totalHoursSpentSubQuery.totalHoursSpent, guarantorEligibilityHours)
										)
									: undefined,
								or(
									...[
										...fuzzySearchFilters([person.identifier], nonEmptySearchQuery),
										...fuzzySearchFilters([person.fname], nonEmptySearchQuery, { distance: 5 }),
										...fuzzySearchFilters([person.lname], nonEmptySearchQuery, { distance: 5 }),
										...fuzzySearchFilters([person.fname, person.lname], nonEmptySearchQuery, {
											distance: 6
										}),
										...fuzzySearchFilters([person.lname, person.fname], nonEmptySearchQuery, {
											distance: 6
										})
									]
								)
							)
						)
						.orderBy(({ leastDistance, leastDistanceIdentifier, identifier }) => [
							leastDistance,
							leastDistanceIdentifier,
							identifier
						])
						.limit(limit)
						.offset(offset)
				: await db
						.select({
							id: person.id,
							identifier: person.identifier,
							type: person.type,
							fname: person.fname,
							lname: person.lname,
							department: person.department,
							university: person.university,
							entryTimestamp: maxEntrySubquery.maxEntryTimestamp,
							entryBuilding: personEntry.building,
							entryGuarantorId: personEntry.guarantorId,
							entryGuarantorFname: guarantorTable.fname,
							entryGuarantorLname: guarantorTable.lname,
							entryGuarantorIdentifier: guarantorTable.identifier,
							exitTimestamp: maxExitSubquery.maxExitTimestamp,
							totalHoursSpent: totalHoursSpentSubQuery.totalHoursSpent
						})
						.from(person)
						.leftJoin(maxEntrySubquery, eq(maxEntrySubquery.personId, person.id))
						.leftJoin(maxExitSubquery, eq(maxExitSubquery.personId, person.id))
						.leftJoin(
							personEntry,
							and(
								eq(personEntry.personId, person.id),
								eq(personEntry.timestamp, maxEntrySubquery.maxEntryTimestamp)
							)
						)
						.leftJoin(guarantorTable, eq(guarantorTable.id, personEntry.guarantorId))
						// TODO: Don't left join when not guarantorSearch
						.leftJoin(totalHoursSpentSubQuery, eq(totalHoursSpentSubQuery.personId, person.id))
						.where(
							guarantorSearch
								? and(
										not(eq(person.type, Guest)),
										gte(totalHoursSpentSubQuery.totalHoursSpent, guarantorEligibilityHours)
									)
								: undefined
						)
						.orderBy(({ identifier }) => [identifier])
						.limit(limit)
						.offset(offset);

		return persons.map((p) => {
			if (!isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}

			const inside = isInside(p.entryTimestamp, p.exitTimestamp);
			return {
				id: p.id,
				identifier: p.identifier,
				type: p.type,
				fname: p.fname,
				lname: p.lname,
				department: p.department,
				university: p.university,
				building: inside ? p.entryBuilding : null,
				guarantorId: inside ? p.entryGuarantorId : null,
				guarantorFname: inside ? p.entryGuarantorFname : null,
				guarantorLname: inside ? p.entryGuarantorLname : null,
				guarantorIdentifier: inside ? p.entryGuarantorIdentifier : null,
				state: inside ? StateInside : StateOutside,
				totalHoursSpent: p.totalHoursSpent
			};
		});
	} catch (err: unknown) {
		throw new Error(`Failed to get persons from database: ${(err as Error).message}`);
	}
}

// Gets all person types
export async function getAllPersonTypes(db: Database): Promise<PersonType[]> {
	try {
		const personTypes = await db
			.selectDistinct({
				type: person.type
			})
			.from(person)
			.orderBy(({ type }) => type);

		return personTypes.map((p) => {
			if (!isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return p.type;
		});
	} catch (err: unknown) {
		throw new Error(`Failed to get all person types from database: ${(err as Error).message}`);
	}
}

export async function getPersonsCount(db: Database): Promise<number> {
	try {
		const [{ total }] = await db
			.select({
				total: count(person.id)
			})
			.from(person);
		return total;
	} catch (err: unknown) {
		throw new Error(`Failed to get persons count from database: ${(err as Error).message}`);
	}
}

// Gets the count of all persons per type
export async function getPersonsCountPerType(db: Database): Promise<
	{
		type: PersonType;
		count: number;
	}[]
> {
	try {
		const persons = await db
			.select({
				type: person.type,
				count: count()
			})
			.from(person)
			.groupBy(person.type)
			.orderBy(({ count }) => count);

		return persons.map((p) => {
			if (p.type !== null && !isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return {
				type: p.type,
				count: p.count
			};
		});
	} catch (err: unknown) {
		throw new Error(
			`Failed to get count of persons per type from database: ${(err as Error).message}`
		);
	}
}

// Gets the count of all persons per department
export async function getPersonsCountPerDepartment(db: Database): Promise<
	{
		type: PersonType;
		department: string;
		count: number;
	}[]
> {
	try {
		const persons = await db
			.select({
				type: person.type,
				department: person.department,
				count: count()
			})
			.from(person)
			.where(not(eq(person.type, Guest)))
			.groupBy(person.type, person.department)
			.orderBy(({ count }) => count);

		return persons.map((p) => {
			if (p.type !== null && !isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return {
				type: p.type,
				department: p.department ?? 'None',
				count: p.count
			};
		});
	} catch (err: unknown) {
		throw new Error(
			`Failed to get count of persons per department from database: ${(err as Error).message}`
		);
	}
}

// Gets the count of all persons per university
export async function getPersonsCountPerUniversity(db: Database): Promise<
	{
		type: PersonType;
		university: string;
		count: number;
	}[]
> {
	try {
		const persons = await db
			.select({
				type: person.type,
				university: person.university,
				count: count()
			})
			.from(person)
			.where(eq(person.type, Guest))
			.groupBy(person.type, person.university)
			.orderBy(({ count }) => count);

		return persons.map((p) => {
			if (p.type !== null && !isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return {
				type: p.type,
				university: p.university ?? 'None',
				count: p.count
			};
		});
	} catch (err: unknown) {
		throw new Error(
			`Failed to get count of persons per university from database: ${(err as Error).message}`
		);
	}
}

// Gets the count of all persons that are inside, per building
export async function getPersonsCountPerBuilding(db: Database): Promise<
	{
		type: PersonType | null;
		building: string;
		count: number;
	}[]
> {
	try {
		const personInsideSubquery = db
			.select({
				personId: person.id,
				type: person.type,
				entryBuilding: personEntry.building,
				maxEntryTimestamp: max(personEntry.timestamp),
				maxExitTimestamp: max(personExit.timestamp)
			})
			.from(person)
			.leftJoin(personEntry, eq(personEntry.personId, person.id))
			.leftJoin(personExit, eq(personExit.personId, person.id))
			.groupBy(person.id, person.type, personEntry.building)
			.having(({ maxEntryTimestamp, maxExitTimestamp }) =>
				or(isNull(maxExitTimestamp), gt(maxEntryTimestamp, maxExitTimestamp))
			)
			.as('person_inside');

		const persons = await db
			.select({
				type: personInsideSubquery.type,
				building: building.name,
				count: count(personInsideSubquery.personId)
			})
			.from(building)
			.leftJoin(personInsideSubquery, eq(building.name, personInsideSubquery.entryBuilding))
			.groupBy(personInsideSubquery.type, building.name)
			.orderBy(({ count }) => count);

		return persons.map((p) => {
			if (p.type !== null && !isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return {
				type: p.type,
				building: p.building,
				count: p.count
			};
		});
	} catch (err: unknown) {
		throw new Error(
			`Failed to get inside count of persons per building from database: ${(err as Error).message}`
		);
	}
}

// Creates an employee (person)
export async function createEmployee(
	db: Database,
	identifier: string,
	fname: string,
	lname: string,
	department: string | undefined,
	building: string,
	creator: string
): Promise<PersonLight> {
	return await createPerson(db, identifier, Employee, fname, lname, building, creator, {
		department
	});
}

// Creates a student (person)
export async function createStudent(
	db: Database,
	identifier: string,
	fname: string,
	lname: string,
	department: string | undefined,
	building: string,
	creator: string
): Promise<PersonLight> {
	return await createPerson(db, identifier, Student, fname, lname, building, creator, {
		department
	});
}

// Creates a student in rectorate mode (uni. instead of dept.) (person)
export async function createStudentRectorateMode(
	db: Database,
	identifier: string,
	fname: string,
	lname: string,
	university: string | undefined,
	building: string,
	creator: string
): Promise<PersonLight> {
	return await createPerson(db, identifier, Student, fname, lname, building, creator, {
		university
	});
}

// Creates a guest (person)
export async function createGuest(
	db: Database,
	identifier: string,
	fname: string,
	lname: string,
	university: string | undefined,
	building: string,
	creator: string,
	guarantorId: number | undefined
): Promise<PersonLight> {
	return await createPerson(db, identifier, Guest, fname, lname, building, creator, {
		university,
		guarantorId
	});
}

// Checks if a guarantor exists in the database and is not a guest
async function validGuarantor(db: Database, guarantorId: number): Promise<boolean> {
	// Check guarantor type
	const [{ type }] = await db
		.select({ type: person.type })
		.from(person)
		.where(eq(person.id, guarantorId));

	if (!isPersonType(type)) {
		throw new Error('Invalid type from DB (not PersonType)');
	}

	// Guarantor must not be a guest
	if (type === Guest) {
		return false;
	}

	// Check guarantor total hours spent
	const timestampPairsSubquery = db
		.select({
			personId: personEntry.personId,
			entryTimestamp: personEntry.timestamp,
			exitTimestamp: min(personExit.timestamp).as('exit_timestamp')
		})
		.from(personEntry)
		.innerJoin(personExit, eq(personExit.personId, personEntry.personId))
		.where(
			and(eq(personEntry.personId, guarantorId), gt(personExit.timestamp, personEntry.timestamp))
		)
		.groupBy(personEntry.personId, personEntry.timestamp)
		.as('timestamp_pairs');

	const hoursSpentSubQuery = db
		.with(timestampPairsSubquery)
		.select({
			hoursSpent: sql<number>`
					extract(epoch from (${timestampPairsSubquery.exitTimestamp} - ${timestampPairsSubquery.entryTimestamp})) / 3600`.as(
				'hours_spent'
			)
		})
		.from(timestampPairsSubquery)
		.as('hours_spent');

	const [{ totalHoursSpent }] = await db
		.select({
			totalHoursSpent: sum(hoursSpentSubQuery.hoursSpent).mapWith(Number).as('total_hours_spent')
		})
		.from(hoursSpentSubQuery)
		.where(lt(hoursSpentSubQuery.hoursSpent, hoursSpentCutoffHours));

	// Guarantor total hours spent must be greater than or equal to guarantorEligibilityHours
	return totalHoursSpent >= guarantorEligibilityHours;
}

// Creates a person and the entry timestamp
export async function createPerson(
	db: Database,
	identifierD: string,
	type: PersonType,
	fnameD: string,
	lnameD: string,
	building: string,
	creator: string,
	opts: {
		department?: string;
		university?: string;
		guarantorId?: number;
	}
): Promise<PersonLight> {
	const department = opts.department ?? null;
	const university = opts.university ?? null;
	const guarantorId = opts.guarantorId ?? null;

	// Assert identifier is valid
	if (identifierD === '') {
		throw new Error('Invalid identifier (empty)');
	}

	// Assert type is valid
	if ((type as string) === '') {
		throw new Error('Invalid type (empty)');
	}

	// Assert fname is valid
	if (fnameD === '') {
		throw new Error('Invalid fname (empty)');
	}

	// Assert lname is valid
	if (lnameD === '') {
		throw new Error('Invalid lname (empty)');
	}

	// Assert department is valid
	if (department && department === '') {
		throw new Error('Invalid department (empty)');
	}

	// Assert university is valid
	if (university && university === '') {
		throw new Error('Invalid university (empty)');
	}

	// Assert building is valid
	if (building === '') {
		throw new Error('Invalid building (empty)');
	}

	// Assert creator is valid
	if (creator === '') {
		throw new Error('Invalid creator (empty)');
	}

	const identifier = sanitizeString(identifierD);
	const fname = capitalizeString(sanitizeString(fnameD));
	const lname = capitalizeString(sanitizeString(lnameD));

	try {
		return await db.transaction(async (tx) => {
			// Check if the guarantor is valid
			if (guarantorId) {
				const valid = await validGuarantor(tx, guarantorId);
				if (!valid) throw new Error('Guarantor not valid');
			}

			// Create the person
			const [{ id }] = await tx
				.insert(person)
				.values({ identifier, type, fname, lname, department, university })
				.returning({ id: person.id });

			// Create the person entry
			await tx.insert(personEntry).values({
				personId: id,
				building,
				creator,
				guarantorId
			});

			return {
				id,
				identifier,
				type,
				fname,
				lname,
				department,
				university,
				building,
				guarantorId,
				state: StateInside // Because the person was just created, they are inside
			};
		});
	} catch (err: unknown) {
		throw new Error(`Failed to create person in database: ${(err as Error).message}`);
	}
}

// Toggles the state of a person (inside to outside and vice versa)
export async function togglePersonState(
	db: Database,
	id: number,
	building: string,
	creator: string,
	guarantorId?: number
): Promise<State> {
	// Assert building is valid
	if (building === '') {
		throw new Error('Invalid building (empty)');
	}

	// Assert creator is valid
	if (creator === '') {
		throw new Error('Invalid creator (empty)');
	}

	try {
		return await db.transaction(async (tx) => {
			// Check if the guarantor is valid
			if (guarantorId) {
				const valid = await validGuarantor(tx, guarantorId);
				if (!valid) throw new Error('Guarantor not valid');
			}

			// Get the person entry timestamp and building
			const [{ entryTimestamp, entryBuilding }] = await tx
				.select({
					entryTimestamp: personEntry.timestamp,
					entryBuilding: personEntry.building
				})
				.from(personEntry)
				.where(eq(personEntry.personId, id))
				.orderBy(desc(personEntry.timestamp))
				.limit(1);

			// Get the person timestamp
			const exits = await tx
				.select({
					exitTimestamp: personExit.timestamp
				})
				.from(personExit)
				.where(eq(personExit.personId, id))
				.orderBy(desc(personExit.timestamp))
				.limit(1);
			const [{ exitTimestamp }] = exits.length === 1 ? exits : [{ exitTimestamp: null }];

			// Toggle the person state
			if (isInside(entryTimestamp, exitTimestamp)) {
				if (building === entryBuilding) {
					// Release the person
					await tx.insert(personExit).values({
						personId: id,
						building,
						creator
					});
					return StateOutside;
				} else {
					// Transfer the person
					await tx.insert(personExit).values({
						personId: id,
						building,
						creator
					});
					await tx.insert(personEntry).values({
						personId: id,
						building,
						creator,
						guarantorId
					});
					return StateInside;
				}
			} else {
				// Admit the person
				await tx.insert(personEntry).values({
					personId: id,
					building,
					creator,
					guarantorId
				});
				return StateInside;
			}
		});
	} catch (err: unknown) {
		throw new Error(`Failed to toggle person state in database: ${(err as Error).message}`);
	}
}

export async function getPersonTypes(db: Database): Promise<PersonType[]> {
	try {
		const types = await db
			.selectDistinctOn([person.type], { type: person.type })
			.from(person)
			.orderBy(person.type);
		return types.reduce((acc, { type }) => {
			if (!isPersonType(type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return [...acc, type];
		}, [] as PersonType[]);
	} catch (err) {
		throw new Error(`Failed to get persons types from database: ${(err as Error).message}`);
	}
}

export async function removePersonsFromBuilding(
	db: Database,
	building: string,
	type: string
): Promise<void> {
	// Assert building is valid
	if (building === '') {
		throw new Error('Invalid building (empty)');
	}

	// Assert type is valid
	if (type === '') {
		throw new Error('Invalid type (empty)');
	}

	try {
		return await db.transaction(async (tx) => {
			const personsInside = await tx
				.select({
					personId: person.id,
					personType: person.type,
					building: personEntry.building,
					maxEntryTimestamp: max(personEntry.timestamp),
					maxExitTimestamp: max(personExit.timestamp)
				})
				.from(person)
				.leftJoin(personEntry, eq(personEntry.personId, person.id))
				.leftJoin(personExit, eq(personExit.personId, person.id))
				.where(and(eq(personEntry.building, building), eq(person.type, type)))
				.groupBy(person.id, person.type, personEntry.building)
				.having(({ maxEntryTimestamp, maxExitTimestamp }) =>
					or(isNull(maxExitTimestamp), gt(maxEntryTimestamp, maxExitTimestamp))
				);

			// Return if no one is found inside the building
			if (personsInside.length === 0) return;

			await tx.insert(personExit).values(
				personsInside.map(({ personId }) => ({
					personId,
					building
				}))
			);
		});
	} catch (err) {
		throw new Error(`Failed to nuke building in database: ${(err as Error).message}`);
	}
}
