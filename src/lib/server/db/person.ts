import type { Database } from './connect';
import { or, eq, and, max, gt, count, isNull, not } from 'drizzle-orm';
import { person, personEntry, personExit } from './schema/person';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzysearch';
import { sqlConcat, sqlLeast, sqlLevenshteinDistance } from './utils';
import { isInside } from '../isInside';
import { capitalizeString, sanitizeString } from '$lib/utils/sanitize';
import { building } from './schema/building';
import { Employee, Guest, isPersonType, Student, type PersonType } from '$lib/types/person';

// Gets all persons using optional filters
export async function getPersons(
	db: Database,
	limit: number,
	offset: number,
	searchQuery?: string
): Promise<
	{
		id: number;
		identifier: string;
		type: PersonType;
		fname: string;
		lname: string;
		department: string | null;
		university: string | null;
		guarantorId: number | null;
		building: string | null;
		state: State;
	}[]
> {
	// Assert limit is valid
	if (limit <= 0) {
		throw new Error('Invalid limit (negative or zero)');
	}

	// Assert offset is valid
	if (offset < 0) {
		throw new Error('Invalid offset (negative)');
	}

	// Don't search if the search query is empty when trimmed
	const sanitizedSearchQuery = searchQuery ? sanitizeString(searchQuery) : undefined;
	const nonEmptySearchQuery = sanitizedSearchQuery
		? sanitizedSearchQuery !== ''
			? sanitizedSearchQuery
			: undefined
		: undefined;

	try {
		const maxEntrySubquery = db
			.select({
				personId: personEntry.personId,
				maxEntryTimestamp: max(personEntry.timestamp).as('max_entry_timestamp')
			})
			.from(personEntry)
			.groupBy(personEntry.personId)
			.as('max_entry');

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
							guarantorId: person.guarantorId,
							entryTimestamp: maxEntrySubquery.maxEntryTimestamp,
							entryBuilding: personEntry.building,
							exitTimestamp: max(personExit.timestamp),
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
						.leftJoin(
							personEntry,
							and(
								eq(personEntry.personId, person.id),
								eq(personEntry.timestamp, maxEntrySubquery.maxEntryTimestamp)
							)
						)
						.leftJoin(personExit, eq(person.id, personExit.personId))
						.where(
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
						.groupBy(
							person.id,
							person.identifier,
							person.type,
							person.fname,
							person.lname,
							person.department,
							person.university,
							person.guarantorId,
							maxEntrySubquery.maxEntryTimestamp,
							personEntry.building
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
							guarantorId: person.guarantorId,
							entryTimestamp: maxEntrySubquery.maxEntryTimestamp,
							entryBuilding: personEntry.building,
							exitTimestamp: max(personExit.timestamp)
						})
						.from(person)
						.leftJoin(maxEntrySubquery, eq(maxEntrySubquery.personId, person.id))
						.leftJoin(
							personEntry,
							and(
								eq(personEntry.personId, person.id),
								eq(personEntry.timestamp, maxEntrySubquery.maxEntryTimestamp)
							)
						)
						.leftJoin(personExit, eq(person.id, personExit.personId))
						.groupBy(
							person.id,
							person.identifier,
							person.type,
							person.fname,
							person.lname,
							person.department,
							person.university,
							person.guarantorId,
							maxEntrySubquery.maxEntryTimestamp,
							personEntry.building
						)
						.orderBy(({ identifier }) => [identifier])
						.limit(limit)
						.offset(offset);

		return persons.map((p) => {
			const inside = isInside(p.entryTimestamp, p.exitTimestamp);
			return {
				id: p.id,
				identifier: p.identifier,
				type: p.type as PersonType,
				fname: p.fname,
				lname: p.lname,
				department: p.department,
				university: p.university,
				guarantorId: p.guarantorId,
				building: inside ? p.entryBuilding : null,
				state: inside ? StateInside : StateOutside
			};
		});
	} catch (err: unknown) {
		throw new Error(`Failed to get persons from database: ${(err as Error).message}`);
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
			.groupBy(person.type);

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
			`Failed to get count of persons per type from database: ${(err as Error).message}}`
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
			.groupBy(person.type, person.department);

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
			`Failed to get count of persons per department from database: ${(err as Error).message}}`
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
			.groupBy(person.type, person.university);

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
			`Failed to get count of persons per university from database: ${(err as Error).message}}`
		);
	}
}

// Gets the count of all persons that are inside, per building
export async function getPersonsCountPerBuilding(db: Database): Promise<
	{
		type: PersonType | null;
		building: string;
		insideCount: number;
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
				insideCount: count(personInsideSubquery.personId)
			})
			.from(building)
			.leftJoin(personInsideSubquery, eq(building.name, personInsideSubquery.entryBuilding))
			.groupBy(personInsideSubquery.type, building.name);

		return persons.map((p) => {
			if (p.type !== null && !isPersonType(p.type)) {
				throw new Error('Invalid type from DB (not PersonType)');
			}
			return {
				type: p.type,
				building: p.building,
				insideCount: p.insideCount
			};
		});
	} catch (err: unknown) {
		throw new Error(
			`Failed to get inside count of persons per building from database: ${(err as Error).message}}`
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
): Promise<{
	id: number;
	identifier: string;
	type: PersonType;
	fname: string;
	lname: string;
	department: string | null;
	university: string | null;
	guarantorId: number | null;
	building: string;
	state: State;
}> {
	return await createPerson(db, identifier, Employee, fname, lname, building, creator, {
		department,
		university: 'Host'
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
): Promise<{
	id: number;
	identifier: string;
	type: PersonType;
	fname: string;
	lname: string;
	department: string | null;
	university: string | null;
	guarantorId: number | null;
	building: string;
	state: State;
}> {
	return await createPerson(db, identifier, Student, fname, lname, building, creator, {
		department,
		university: 'Host'
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
): Promise<{
	id: number;
	identifier: string;
	type: PersonType;
	fname: string;
	lname: string;
	department: string | null;
	university: string | null;
	guarantorId: number | null;
	building: string;
	state: State;
}> {
	return await createPerson(db, identifier, Guest, fname, lname, building, creator, {
		university,
		guarantorId
	});
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
): Promise<{
	id: number;
	identifier: string;
	type: PersonType;
	fname: string;
	lname: string;
	department: string | null;
	university: string | null;
	guarantorId: number | null;
	building: string;
	state: State;
}> {
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
			// Create the person
			const [{ id }] = await tx
				.insert(person)
				.values({ identifier, type, fname, lname, department, university, guarantorId })
				.returning({ id: person.id });

			// Create the person entry
			await tx.insert(personEntry).values({
				personId: id,
				building,
				creator
			});

			return {
				id,
				identifier,
				type,
				fname,
				lname,
				department,
				university,
				guarantorId,
				building,
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
	creator: string
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
			// Get the person entry and exit timestamps
			const [{ entryTimestamp, exitTimestamp }] = await tx
				.select({
					id: person.id,
					entryTimestamp: max(personEntry.timestamp),
					exitTimestamp: max(personExit.timestamp)
				})
				.from(person)
				.leftJoin(personEntry, eq(person.id, personEntry.personId))
				.leftJoin(personExit, eq(person.id, personExit.personId))
				.where(eq(person.id, id))
				.groupBy(person.id);

			// Toggle the person state
			if (isInside(entryTimestamp, exitTimestamp)) {
				// Exit the person
				await tx.insert(personExit).values({
					personId: id,
					building,
					creator
				});
				return StateOutside;
			} else {
				// Enter the person
				await tx.insert(personEntry).values({
					personId: id,
					building,
					creator
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
