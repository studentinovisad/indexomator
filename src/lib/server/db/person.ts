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
	isNotNull
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { person, personEntry, personExit } from './schema/person';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzysearch';
import { descNulls, sqlConcat, sqlLeast, sqlLevenshteinDistance } from './utils';
import { isInside } from '../isInside';
import { capitalizeString, sanitizeString } from '$lib/utils/sanitize';
import { building } from './schema/building';
import {
	Employee,
	Guest,
	isPersonType,
	Student,
	type Guarantor,
	type Person,
	type PersonType
} from '$lib/types/person';
import {
	guarantorEligibilityHours,
	guarantorMaxGuests,
	optionalGuarantor,
	rectorateMode
} from '$lib/utils/env';
import { hoursSpentCutoffHours } from '$lib/server/env';

type searchOptions = {
	searchQuery?: string;
};

// Gets all persons
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

	try {
		const guarantor = alias(person, 'guarantor');

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
							banned: person.banned,
							entryTimestamp: maxEntrySubquery.maxEntryTimestamp,
							entryBuilding: personEntry.building,
							entryGuarantorId: personEntry.guarantorId,
							entryGuarantorFname: guarantor.fname,
							entryGuarantorLname: guarantor.lname,
							entryGuarantorIdentifier: guarantor.identifier,
							exitTimestamp: maxExitSubquery.maxExitTimestamp,
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
						.leftJoin(guarantor, eq(guarantor.id, personEntry.guarantorId))
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
						.orderBy(({ leastDistance, leastDistanceIdentifier, entryTimestamp, identifier }) => [
							leastDistance,
							leastDistanceIdentifier,
							descNulls(entryTimestamp),
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
							banned: person.banned,
							entryTimestamp: maxEntrySubquery.maxEntryTimestamp,
							entryBuilding: personEntry.building,
							entryGuarantorId: personEntry.guarantorId,
							entryGuarantorFname: guarantor.fname,
							entryGuarantorLname: guarantor.lname,
							entryGuarantorIdentifier: guarantor.identifier,
							exitTimestamp: maxExitSubquery.maxExitTimestamp
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
						.orderBy(({ entryTimestamp, identifier }) => [descNulls(entryTimestamp), identifier])
						.leftJoin(guarantor, eq(guarantor.id, personEntry.guarantorId))
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
				banned: p.banned
			};
		});
	} catch (err) {
		throw new Error(`Failed to get persons from database: ${(err as Error).message}`);
	}
}

// Gets all guarantors
export async function getGuarantors(
	db: Database,
	limit: number,
	opts: searchOptions = {}
): Promise<Guarantor[]> {
	// Assert limit is valid
	if (limit <= 0) {
		throw new Error('Invalid limit (negative or zero)');
	}

	// Don't search if the search query is empty when trimmed
	const sanitizedSearchQuery = opts.searchQuery ? sanitizeString(opts.searchQuery) : undefined;
	const nonEmptySearchQuery = sanitizedSearchQuery
		? sanitizedSearchQuery !== ''
			? sanitizedSearchQuery
			: undefined
		: undefined;

	try {
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

		const guarantors =
			nonEmptySearchQuery !== undefined
				? await db
						.select({
							id: person.id,
							identifier: person.identifier,
							fname: person.fname,
							lname: person.lname,
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
						.leftJoin(totalHoursSpentSubQuery, eq(totalHoursSpentSubQuery.personId, person.id))
						.where(
							and(
								eq(person.banned, false),
								not(eq(person.type, Guest)),
								guarantorEligibilityHours !== 0
									? gte(totalHoursSpentSubQuery.totalHoursSpent, guarantorEligibilityHours)
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
				: await db
						.select({
							id: person.id,
							identifier: person.identifier,
							fname: person.fname,
							lname: person.lname
						})
						.from(person)
						.leftJoin(totalHoursSpentSubQuery, eq(totalHoursSpentSubQuery.personId, person.id))
						.where(
							and(
								eq(person.banned, false),
								not(eq(person.type, Guest)),
								guarantorEligibilityHours !== 0
									? gte(totalHoursSpentSubQuery.totalHoursSpent, guarantorEligibilityHours)
									: undefined
							)
						)
						.orderBy(({ identifier }) => [identifier])
						.limit(limit);

		return guarantors.map((g) => {
			return {
				id: g.id,
				identifier: g.identifier,
				fname: g.fname,
				lname: g.lname
			};
		});
	} catch (err) {
		throw new Error(`Failed to get guarantors from database: ${(err as Error).message}`);
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
	} catch (err) {
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
	} catch (err) {
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
	} catch (err) {
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
	} catch (err) {
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
			.where(!rectorateMode ? eq(person.type, Guest) : undefined)
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
	} catch (err) {
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
				and(
					isNotNull(maxEntryTimestamp),
					or(isNull(maxExitTimestamp), gte(maxEntryTimestamp, maxExitTimestamp))
				)
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
	} catch (err) {
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
	creator: string,
	entry: boolean
): Promise<Person> {
	return await createPerson(db, identifier, Employee, fname, lname, building, creator, {
		entry,
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
	creator: string,
	entry: boolean
): Promise<Person> {
	return await createPerson(db, identifier, Student, fname, lname, building, creator, {
		entry,
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
	creator: string,
	entry: boolean
): Promise<Person> {
	return await createPerson(db, identifier, Student, fname, lname, building, creator, {
		entry,
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
	guarantorId: number | undefined,
	entry: boolean
): Promise<Person> {
	return await createPerson(db, identifier, Guest, fname, lname, building, creator, {
		entry,
		university,
		guarantorId
	});
}

// Checks if a guarantor exists in the database and is not a guest
async function validGuarantor(db: Database, guarantorId: number): Promise<void> {
	// Check guarantor type
	const [{ banned, type }] = await db
		.select({ banned: person.banned, type: person.type })
		.from(person)
		.where(eq(person.id, guarantorId));

	if (!isPersonType(type)) {
		throw new Error('Invalid type from DB (not PersonType)');
	}

	// Guarantor must not be banned
	if (banned) {
		throw new Error("Guarantor can't be banned");
	}

	// Guarantor must not be a guest
	if (type === Guest) {
		throw new Error("Guarantor can't be a guest");
	}

	// Check if guarantor has used all his guarantee slots
	const insideGuestCount = await getInsideGuestCount(db, guarantorId);
	if (guarantorMaxGuests && insideGuestCount >= guarantorMaxGuests) {
		throw new Error('Guarantor reached maximum number of inside guests');
	}

	// Check guarantor total hours spent (if required)
	if (guarantorEligibilityHours !== 0) {
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
		if (totalHoursSpent < guarantorEligibilityHours) {
			throw new Error(`Guarantor doesn't have enough hours (${guarantorEligibilityHours})`);
		}
	}
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
		entry: boolean;
		department?: string;
		university?: string;
		guarantorId?: number;
	}
): Promise<Person> {
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
				try {
					await validGuarantor(tx, guarantorId);
				} catch (err) {
					throw new Error(`Invalid guarantor: ${(err as Error).message}`);
				}
			}

			// Create the person
			const [{ id }] = await tx
				.insert(person)
				.values({ identifier, type, fname, lname, department, university })
				.returning({ id: person.id });

			// Create the person entry
			if (opts.entry) {
				await tx.insert(personEntry).values({
					personId: id,
					building,
					creator,
					guarantorId
				});
			}
			const state = opts.entry ? StateInside : StateOutside;

			const [{ guarantorFname, guarantorLname, guarantorIdentifier }] = guarantorId
				? await tx
						.select({
							guarantorFname: person.fname,
							guarantorLname: person.lname,
							guarantorIdentifier: person.identifier
						})
						.from(person)
						.where(eq(person.id, guarantorId))
				: [
						{
							guarantorFname: null,
							guarantorLname: null,
							guarantorIdentifier: null
						}
					];

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
				guarantorFname,
				guarantorLname,
				guarantorIdentifier,
				banned: false,
				state
			};
		});
	} catch (err) {
		throw new Error(`Failed to create person in database: ${(err as Error).message}`);
	}
}

// Toggles the state of a person (inside to outside and vice versa)
export async function togglePersonState(
	db: Database,
	id: number,
	building: string,
	creator: string,
	action: 'admit' | 'release' | 'transfer',
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
			// Check if the person is banned
			const [{ banned }] = await tx
				.select({ banned: person.banned })
				.from(person)
				.where(eq(person.id, id));
			if (banned) {
				throw new Error('Person is banned and cannot change state');
			}

			// Check if the guarantor is valid
			if (guarantorId) {
				try {
					await validGuarantor(tx, guarantorId);
				} catch (err) {
					throw new Error(`Invalid guarantor: ${(err as Error).message}`);
				}
			}

			// Get the person entry timestamp and building
			const entries = await tx
				.select({
					entryTimestamp: personEntry.timestamp,
					entryBuilding: personEntry.building
				})
				.from(personEntry)
				.where(eq(personEntry.personId, id))
				.orderBy(desc(personEntry.timestamp))
				.limit(1);
			const [{ entryTimestamp, entryBuilding }] =
				entries.length === 1 ? entries : [{ entryTimestamp: null, entryBuilding: null }];

			// Get the person exit timestamp
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
					if (action !== 'release') {
						throw new Error(
							`Can't perform ${action} as another was already triggered (interface isn't synced with the server, please refresh the page)`
						);
					}

					// Release the person
					await tx.insert(personExit).values({
						personId: id,
						building,
						creator
					});

					return StateOutside;
				} else {
					if (action !== 'transfer') {
						throw new Error(
							`Can't perform ${action} as another was already triggered (interface isn't synced with the server, please refresh the page)`
						);
					}

					// Check if the guarantor is set (if required)
					if (!optionalGuarantor && guarantorId === undefined) {
						// Get the person type
						const [{ type }] = await tx
							.select({ type: person.type })
							.from(person)
							.where(eq(person.id, id));
						if (!isPersonType(type)) {
							throw new Error('Invalid type from DB (not PersonType)');
						}

						// Check if the person is a guest
						if (type === Guest) {
							throw new Error('Guest requires a guarantor to be set');
						}
					}

					// (Transfer) Release the person
					await tx.insert(personExit).values({
						personId: id,
						building,
						creator
					});

					// Check if the guarantor is valid
					// This calculates the current guests inside for guarantor,
					// which is why we release the person beforehand
					if (guarantorId) {
						try {
							await validGuarantor(tx, guarantorId);
						} catch (err) {
							throw new Error(`Invalid guarantor: ${(err as Error).message}`);
						}
					}

					// (Transfer) Admit the person
					await tx.insert(personEntry).values({
						personId: id,
						building,
						creator,
						guarantorId
					});

					return StateInside;
				}
			} else {
				if (action !== 'admit') {
					throw new Error(
						`Can't perform ${action} as another was already triggered (interface isn't synced with the server, please refresh the page)`
					);
				}

				// Check if the guarantor is set (if required)
				if (!optionalGuarantor && guarantorId === undefined) {
					// Get the person type
					const [{ type }] = await tx
						.select({ type: person.type })
						.from(person)
						.where(eq(person.id, id));
					if (!isPersonType(type)) {
						throw new Error('Invalid type from DB (not PersonType)');
					}

					// Check if the person is a guest
					if (type === Guest) {
						throw new Error('Guest requires a guarantor to be set');
					}
				}

				// Check if the guarantor is valid
				if (guarantorId) {
					try {
						await validGuarantor(tx, guarantorId);
					} catch (err) {
						throw new Error(`Invalid guarantor: ${(err as Error).message}`);
					}
				}

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
	} catch (err) {
		throw new Error(`Failed to toggle person state in database: ${(err as Error).message}`);
	}
}

export async function getInsideGuests(db: Database, guarantorId: number): Promise<Guest[]> {
	try {
		const guestsInside = await db
			.select({
				id: person.id,
				identifier: person.identifier,
				fname: person.fname,
				lname: person.lname,
				university: person.university,
				maxEntryTimestamp: max(personEntry.timestamp),
				maxExitTimestamp: max(personExit.timestamp)
			})
			.from(person)
			.leftJoin(personEntry, eq(personEntry.personId, person.id))
			.leftJoin(personExit, eq(personExit.personId, person.id))
			.where(eq(personEntry.guarantorId, guarantorId))
			.groupBy(person.id)
			.having(({ maxEntryTimestamp, maxExitTimestamp }) =>
				and(
					isNotNull(maxEntryTimestamp),
					or(isNull(maxExitTimestamp), gte(maxEntryTimestamp, maxExitTimestamp))
				)
			)
			.orderBy(({ university, fname, lname, identifier }) => [
				university,
				fname,
				lname,
				identifier
			]);

		return guestsInside.map((g) => ({
			id: g.id,
			identifier: g.identifier,
			fname: g.fname,
			lname: g.lname,
			university: g.university
		}));
	} catch (err) {
		throw new Error(`Failed to get guests from database: ${(err as Error).message}`);
	}
}

export async function getInsideGuestCount(db: Database, guarantorId: number): Promise<number> {
	try {
		const guestsInsideSubquery = db
			.select({
				guestId: person.id,
				maxEntryTimestamp: max(personEntry.timestamp),
				maxExitTimestamp: max(personExit.timestamp)
			})
			.from(person)
			.leftJoin(personEntry, eq(personEntry.personId, person.id))
			.leftJoin(personExit, eq(personExit.personId, person.id))
			.where(eq(personEntry.guarantorId, guarantorId))
			.groupBy(person.id)
			.having(({ maxEntryTimestamp, maxExitTimestamp }) =>
				and(
					isNotNull(maxEntryTimestamp),
					or(isNull(maxExitTimestamp), gte(maxEntryTimestamp, maxExitTimestamp))
				)
			)
			.as('guests_inside');

		const [{ guestCount }] = await db
			.select({
				guestCount: count(guestsInsideSubquery.guestId)
			})
			.from(guestsInsideSubquery);

		return guestCount;
	} catch (err) {
		throw new Error(`Failed to get guest count from database: ${(err as Error).message}`);
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

export async function setPersonBannedStatus(
	db: Database,
	id: number,
	action: 'ban' | 'pardon'
): Promise<void> {
	const newBan = action === 'ban';
	const actionMsg = action === 'ban' ? 'banned' : 'pardoned';

	try {
		await db.transaction(async (tx) => {
			const [{ banned }] = await tx
				.select({ banned: person.banned })
				.from(person)
				.where(eq(person.id, id));
			if (newBan === banned) {
				throw new Error(`Person is already ${actionMsg}`);
			}

			if (newBan) {
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

				// Get the person exit timestamp
				const exits = await tx
					.select({
						exitTimestamp: personExit.timestamp
					})
					.from(personExit)
					.where(eq(personExit.personId, id))
					.orderBy(desc(personExit.timestamp))
					.limit(1);
				const [{ exitTimestamp }] = exits.length === 1 ? exits : [{ exitTimestamp: null }];

				if (isInside(entryTimestamp, exitTimestamp)) {
					// Release the person
					await tx.insert(personExit).values({
						personId: id,
						building: entryBuilding
					});
				}
			}

			await tx.update(person).set({ banned: newBan }).where(eq(person.id, id));
		});
	} catch (err) {
		throw new Error(`Failed to ${action} person in database: ${(err as Error).message}`);
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
					and(
						isNotNull(maxEntryTimestamp),
						or(isNull(maxExitTimestamp), gte(maxEntryTimestamp, maxExitTimestamp))
					)
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
