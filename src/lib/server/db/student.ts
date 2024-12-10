import { or, desc, eq, sql } from 'drizzle-orm';
import { student, studentEntry, studentExit } from './schema/student';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { fuzzySearchFilters } from './fuzzysearch';
import { isInside } from '../isInside';
import { DB as db } from './connect';

// Gets all students using optional filters
export async function getStudents(searchQuery?: string): Promise<
	{
		id: number;
		index: string;
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
		const students = await db
			.select({
				id: student.id,
				index: student.index,
				fname: student.fname,
				lname: student.lname,
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
								...fuzzySearchFilters(student.index, nonEmptySearchQuery),
								...fuzzySearchFilters(student.fname, nonEmptySearchQuery),
								...fuzzySearchFilters(student.lname, nonEmptySearchQuery)
							]
						: [])
				)
			)
			.groupBy(student.id, student.index, student.fname, student.lname);

		return students.map((s) => {
			return {
				id: s.id,
				index: s.index,
				fname: s.fname,
				lname: s.lname,
				state: isInside(s.entryTimestamp, s.exitTimestamp) ? StateInside : StateOutside
			};
		});
	} catch (err: any) {
		throw new Error(`Failed to get students from database: ${JSON.stringify(err)}`);
	}
}

// Creates a student and the entry timestamp
export async function createStudent(
	index: string,
	fname: string,
	lname: string
): Promise<{
	id: number;
	index: string;
	fname: string;
	lname: string;
	state: State;
}> {
	// Assert fname, lname and index are valid
	if (
		index === null ||
		index === undefined ||
		index === '' ||
		fname === null ||
		fname === undefined ||
		fname === '' ||
		lname === null ||
		lname === undefined ||
		lname === ''
	) {
		throw new Error('Invalid student data');
	}

	try {
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
				index,
				fname,
				lname,
				state: StateInside // Because the student was just created, he is inside
			};
		});
	} catch (err: any) {
		throw new Error(`Failed to create student in database: ${JSON.stringify(err)}`);
	}
}

// Toggles the state of a student (inside to outside and vice versa)
export async function toggleStudentState(id: number): Promise<State> {
	// Assert id is valid
	if (id === null || id === undefined) {
		throw new Error('Invalid student id');
	}

	try {
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
			const exitTimestamp = exits.length > 0 ? exits[0].timestamp : null;

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
	} catch (err: any) {
		throw new Error(`Failed to toggle student state in database: ${JSON.stringify(err)}`);
	}
}
