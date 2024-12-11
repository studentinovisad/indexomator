import { or, desc, eq, sql } from 'drizzle-orm';
import { employee, employeeEntry, employeeExit } from './schema/employee';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzysearch';
import { isInside } from '../isInside';
import { DB as db } from './connect';
import { sanitizeString } from '$lib/utils/sanitize';

// Gets all employees using optional filters
export async function getEmployees(searchQuery?: string): Promise<
	{
		id: number;
		email: string;
		fname: string;
		lname: string;
		state: State;
	}[]
> {
	// Don't search if the search query is empty when trimmed
	const nonEmptySearchQuery = searchQuery
		? searchQuery.trim() !== ''
			? searchQuery
			: undefined
		: undefined;

	try {
		const employees = await db
			.select({
				id: employee.id,
				email: employee.email,
				fname: employee.fname,
				lname: employee.lname,
				entryTimestamp: sql<Date>`MAX(${employeeEntry.timestamp})`.as('entryTimestamp'),
				exitTimestamp: sql<Date | null>`MAX(${employeeExit.timestamp})`.as('exitTimestamp')
			})
			.from(employee)
			.leftJoin(employeeEntry, eq(employee.id, employeeEntry.employeeId))
			.leftJoin(employeeExit, eq(employee.id, employeeExit.employeeId))
			.where(
				or(
					...(nonEmptySearchQuery
						? [
								...fuzzySearchFilters(employee.email, nonEmptySearchQuery),
								...fuzzySearchFilters(employee.fname, nonEmptySearchQuery),
								...fuzzySearchFilters(employee.lname, nonEmptySearchQuery)
							]
						: [])
				)
			)
			.groupBy(employee.id, employee.fname, employee.lname);

		return employees.map((s) => {
			return {
				id: s.id,
				email: s.email,
				fname: s.fname,
				lname: s.lname,
				state: isInside(s.entryTimestamp, s.exitTimestamp) ? StateInside : StateOutside
			};
		});
	} catch (err: any) {
		throw new Error('Failed to get employees from database:' + err.message);
	}
}

// Creates an employee and the entry timestamp
export async function createEmployee(
	emailD: string,
	fnameD: string,
	lnameD: string
): Promise<{
	id: number;
	email: string;
	fname: string;
	lname: string;
	state: State;
}> {
	// Assert email, fname and lname are valid
	if (
		emailD === null ||
		emailD === undefined ||
		emailD === '' ||
		fnameD === null ||
		fnameD === undefined ||
		fnameD === '' ||
		lnameD === null ||
		lnameD === undefined ||
		lnameD === ''
	) {
		throw new Error('Invalid employee data');
	}

	const email = sanitizeString(emailD);
	const fname = sanitizeString(fnameD);
	const lname = sanitizeString(lnameD);

	try {
		return await db.transaction(async (tx) => {
			// Create the employee
			const [{ id }] = await tx
				.insert(employee)
				.values({ email, fname, lname })
				.returning({ id: employee.id });

			// Create the employee entry
			await tx.insert(employeeEntry).values({ employeeId: id });

			return {
				id,
				email,
				fname,
				lname,
				state: StateInside // Because the employee was just created, they are inside
			};
		});
	} catch (err: any) {
		throw new Error('Failed to create employee in database:' + err.message);
	}
}

// Toggles the state of an employee (inside to outside and vice versa)
export async function toggleEmployeeState(id: number): Promise<State> {
	// Assert id is valid
	if (id === null || id === undefined) {
		throw new Error('Invalid employee id');
	}

	try {
		return await db.transaction(async (tx) => {
			// Get the employee entry
			const [{ timestamp: entryTimestamp }] = await tx
				.select({
					timestamp: employeeEntry.timestamp
				})
				.from(employeeEntry)
				.where(eq(employeeEntry.employeeId, id))
				.orderBy(desc(employeeEntry.timestamp))
				.limit(1);

			// Get the employee exit
			const exits = await tx
				.select({
					timestamp: employeeExit.timestamp
				})
				.from(employeeExit)
				.where(eq(employeeExit.employeeId, id))
				.orderBy(desc(employeeExit.timestamp))
				.limit(1);
			const exitTimestamp = exits.length > 0 ? exits[0].timestamp : null;

			// Toggle the employee state
			if (isInside(entryTimestamp, exitTimestamp)) {
				// Exit the employee
				await tx.insert(employeeExit).values({ employeeId: id });
				return StateOutside;
			} else {
				// Enter the employee
				await tx.insert(employeeEntry).values({ employeeId: id });
				return StateInside;
			}
		});
	} catch (err: any) {
		throw new Error('Failed to toggle employee state in database:' + err.message);
	}
}
