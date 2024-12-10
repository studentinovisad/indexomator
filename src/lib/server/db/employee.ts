import { or, desc, eq, sql } from 'drizzle-orm';
import { employee, employeeEntry, employeeExit } from './schema/employee';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzysearch';
import { isInside } from '../isInside';
import { DB as db } from './connect';

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
	// Assert searchQuery is valid, if it is provided
	const nonEmptySearchQuery = searchQuery
		? searchQuery.trim() !== ''
			? searchQuery
			: undefined
		: undefined;

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
}

// Creates an employee and the entry timestamp
export async function createEmployee(
	email: string,
	fname: string,
	lname: string
): Promise<{
	id: number;
	email: string;
	fname: string;
	lname: string;
	state: State;
}> {
	// Assert email, fname and lname are valid
	if (
		email === null ||
		email === undefined ||
		email === '' ||
		fname === null ||
		fname === undefined ||
		fname === '' ||
		lname === null ||
		lname === undefined ||
		lname === ''
	) {
		throw new Error('Invalid employee data');
	}

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
}

// Toggles the state of an employee (inside to outside and vice versa)
export async function toggleEmployeeState(id: number): Promise<State> {
	// Assert id is valid
	if (id === null || id === undefined) {
		throw new Error('Invalid employee id');
	}

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
}
