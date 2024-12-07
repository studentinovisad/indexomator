import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '.';
import { employee, employeeEntry, employeeExit } from './schema/employee';
import { StateInside, StateOutside, type State } from '$lib/types/state';

export async function getEmployees(
	fname: string | undefined = undefined,
	lname: string | undefined = undefined,
	personalId: string | undefined = undefined
): Promise<
	{
		id: number;
		fname: string;
		lname: string;
		personalId: string;
		state: State;
	}[]
> {
	// Assert fname, lname and personalId are not null nor empty, undefined is allowed
	if (
		fname === null ||
		fname === '' ||
		lname === null ||
		lname === '' ||
		personalId === null ||
		personalId === ''
	) {
		throw new Error('Invalid employee data');
	}

	const employees = await db
		.select({
			id: employee.id,
			fname: employee.fname,
			lname: employee.lname,
			personalId: employee.personalId,
			entryTimestamp: sql<Date>`MAX(${employeeEntry.timestamp})`.as('entryTimestamp'),
			exitTimestamp: sql<Date>`MAX(${employeeExit.timestamp})`.as('exitTimestamp')
		})
		.from(employee)
		.leftJoin(employeeEntry, eq(employee.id, employeeEntry.employeeId))
		.leftJoin(employeeExit, eq(employee.id, employeeExit.employeeId))
		.where(
			and(
				fname ? eq(employee.fname, fname) : undefined,
				lname ? eq(employee.lname, lname) : undefined,
				personalId ? eq(employee.personalId, personalId) : undefined
			)
		)
		.groupBy(employee.id, employee.fname, employee.lname, employee.personalId);

	return employees.map((s) => {
		const isInside = s.entryTimestamp > s.exitTimestamp;
		return {
			id: s.id,
			fname: s.fname,
			lname: s.lname,
			personalId: s.personalId,
			state: isInside ? StateInside : StateOutside
		};
	});
}

export async function createEmployee(
	fname: string,
	lname: string,
	personalId: string
): Promise<{
	id: number;
	fname: string;
	lname: string;
	personalId: string;
	state: State;
}> {
	// Assert fname, lname and personalId are not null nor undefined nor empty
	if (
		fname === null ||
		fname === undefined ||
		fname === '' ||
		lname === null ||
		lname === undefined ||
		lname === '' ||
		personalId === null ||
		personalId === undefined ||
		personalId === ''
	) {
		throw new Error('Invalid employee data');
	}

	return await db.transaction(async (tx) => {
		// Create the employee
		const [{ id }] = await tx
			.insert(employee)
			.values({ fname, lname, personalId })
			.returning({ id: employee.id })
			.execute();

		// Create the employee entry
		await tx.insert(employeeEntry).values({ employeeId: id }).execute();

		return {
			id,
			fname,
			lname,
			personalId,
			state: StateInside // Because the employee was just created, he is inside
		};
	});
}

export async function getEmployeeState(id: number): Promise<State> {
	// Assert id is not null or undefined
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
		const [{ timestamp: exitTimestamp }] = await tx
			.select({
				timestamp: employeeExit.timestamp
			})
			.from(employeeExit)
			.where(eq(employeeExit.employeeId, id))
			.orderBy(desc(employeeExit.timestamp))
			.limit(1);

		// Determine if the employee is inside or outside
		const isInside = entryTimestamp > exitTimestamp;

		return isInside ? StateInside : StateOutside;
	});
}

export async function toggleEmployeeState(id: number): Promise<State> {
	// Assert id is not null or undefined
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
		const [{ timestamp: exitTimestamp }] = await tx
			.select({
				timestamp: employeeExit.timestamp
			})
			.from(employeeExit)
			.where(eq(employeeExit.employeeId, id))
			.orderBy(desc(employeeExit.timestamp))
			.limit(1);

		// Determine if the employee is inside or outside
		const isInside = entryTimestamp > exitTimestamp;

		// Toggle the employee state
		if (isInside) {
			// Exit the employee
			await tx.insert(employeeExit).values({ employeeId: id }).execute();
		} else {
			// Enter the employee
			await tx.insert(employeeEntry).values({ employeeId: id }).execute();
		}

		// Determine the new state
		const newIsInside = !isInside;

		return newIsInside ? StateInside : StateOutside;
	});
}
