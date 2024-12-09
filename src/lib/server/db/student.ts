import { and, or, desc, eq, ilike, sql, Column } from 'drizzle-orm';
import { student, studentEntry, studentExit } from './schema/student';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzySearch';
import { isInside } from '../isInside';
import { DB as db } from './connect';

// Gets all students using optional filters
export async function getStudents(searchQuery?: string): Promise<
	{
		id: number;
		fname: string;
		lname: string;
		index: string;
		state: State;
	}[]
> {
	// Assert searchQuery is not null nor empty, if it is provided
	if (searchQuery === null) {
		throw new Error('Invalid search query');
	}
	const nonEmptySearchQuery = searchQuery
		? searchQuery.trim() !== ''
			? searchQuery
			: undefined
		: undefined;

	const students = await db
		.select({
			id: student.id,
			fname: student.fname,
			lname: student.lname,
			index: student.index,
			entryTimestamp: sql<Date>`MAX(${studentEntry.timestamp})`.as('entryTimestamp'),
			exitTimestamp: sql<Date | null>`MAX(${studentExit.timestamp})`.as('exitTimestamp')
		})
		.from(student)
		.leftJoin(studentEntry, eq(student.id, studentEntry.studentId))
		.leftJoin(studentExit, eq(student.id, studentExit.studentId))
		.where(
			or(
				...(nonEmptySearchQuery
					? [
							...fuzzySearchFilters(student.fname, nonEmptySearchQuery),
							...fuzzySearchFilters(student.lname, nonEmptySearchQuery),
							...fuzzySearchFilters(student.index, nonEmptySearchQuery)
						]
					: [])
			)
		)
		.groupBy(student.id, student.fname, student.lname, student.index);

	return students.map((s) => {
		return {
			id: s.id,
			fname: s.fname,
			lname: s.lname,
			index: s.index,
			state: isInside(s.entryTimestamp, s.exitTimestamp) ? StateInside : StateOutside
		};
	});
}

// Creates a student and the entry timestamp
export async function createStudent(
	fname: string,
	lname: string,
	index: string
): Promise<{
	id: number;
	fname: string;
	lname: string;
	index: string;
	state: State;
}> {
	// Assert fname, lname and index are valid
	if (
		fname === null ||
		fname === undefined ||
		fname === '' ||
		lname === null ||
		lname === undefined ||
		lname === '' ||
		index === null ||
		index === undefined ||
		index === ''
	) {
		throw new Error('Invalid student data');
	}

	return await db.transaction(async (tx) => {
		// Create the student
		const [{ id }] = await tx
			.insert(student)
			.values({ fname, lname, index })
			.returning({ id: student.id });

		// Create the student entry
		await tx.insert(studentEntry).values({ studentId: id });

		return {
			id,
			fname,
			lname,
			index,
			state: StateInside // Because the student was just created, he is inside
		};
	});
}

// Gets the state of a student (either inside or outside)
export async function getStudentState(id: number): Promise<State> {
	// Assert id is valid
	if (id === null || id === undefined) {
		throw new Error('Invalid student id');
	}

	return await db.transaction(async (tx) => {
		// Get the student entry
		const [{ timestamp: entryTimestamp }] = await tx
			.select({
				timestamp: studentEntry.timestamp
			})
			.from(studentEntry)
			.where(eq(studentEntry.studentId, id))
			.orderBy(desc(studentEntry.timestamp))
			.limit(1);

		// Get the student exit
		const exits = await tx
			.select({
				timestamp: studentExit.timestamp
			})
			.from(studentExit)
			.where(eq(studentExit.studentId, id))
			.orderBy(desc(studentExit.timestamp))
			.limit(1);
		let exitTimestamp: Date | null = null;
		if (exits.length > 0) {
			exitTimestamp = exits[0].timestamp;
		}

		return isInside(entryTimestamp, exitTimestamp) ? StateInside : StateOutside;
	});
}

// Toggles the state of a student (inside to outside and vice versa)
export async function toggleStudentState(id: number): Promise<State> {
	// Assert id is valid
	if (id === null || id === undefined) {
		throw new Error('Invalid student id');
	}

	return await db.transaction(async (tx) => {
		// Get the student entry
		const [{ timestamp: entryTimestamp }] = await tx
			.select({
				timestamp: studentEntry.timestamp
			})
			.from(studentEntry)
			.where(eq(studentEntry.studentId, id))
			.orderBy(desc(studentEntry.timestamp))
			.limit(1);

		// Get the student exit
		const exits = await tx
			.select({
				timestamp: studentExit.timestamp
			})
			.from(studentExit)
			.where(eq(studentExit.studentId, id))
			.orderBy(desc(studentExit.timestamp))
			.limit(1);
		let exitTimestamp: Date | null = null;
		if (exits.length > 0) {
			exitTimestamp = exits[0].timestamp;
		}

		// Toggle the student state
		if (isInside(entryTimestamp, exitTimestamp)) {
			// Exit the student
			await tx.insert(studentExit).values({ studentId: id });
			return StateOutside;
		} else {
			// Enter the student
			await tx.insert(studentEntry).values({ studentId: id });
			return StateInside;
		}
	});
}
