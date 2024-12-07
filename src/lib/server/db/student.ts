import { and, or, desc, eq, ilike, sql, Column } from 'drizzle-orm';
import { db } from '.';
import { student, studentEntry, studentExit } from './schema/student';
import { StateInside, StateOutside, type State } from '$lib/types/state';

const EDIT_DISTANCE = 2; // Distance for Levenshteins fuzzy search alghoritm

function fuzzySearchFilters(dbField: Column, searchQuery: string) {
	return [
		sql`LEVENSHTEIN(${dbField}, ${searchQuery}) < ${EDIT_DISTANCE}`,
		ilike(dbField, `${searchQuery}%`)
	];
}

// Gets all students using optional filters
export async function getStudents({
	fname,
	lname,
	index
}: {
	fname?: string;
	lname?: string;
	index?: string;
} = {}): Promise<
	{
		id: number;
		fname: string;
		lname: string;
		index: string;
		state: State;
	}[]
> {
	// Assert fname, lname and index are not null nor empty, undefined is allowed
	if (
		fname === null ||
		fname === '' ||
		lname === null ||
		lname === '' ||
		index === null ||
		index === ''
	) {
		throw new Error('Invalid student data');
	}

	const students = await db
		.select({
			id: student.id,
			fname: student.fname,
			lname: student.lname,
			index: student.index,
			entryTimestamp: sql<Date>`MAX(${studentEntry.timestamp})`.as('entryTimestamp'),
			exitTimestamp: sql<Date>`MAX(${studentExit.timestamp})`.as('exitTimestamp')
		})
		.from(student)
		.leftJoin(studentEntry, eq(student.id, studentEntry.studentId))
		.leftJoin(studentExit, eq(student.id, studentExit.studentId))
		.where(
			or(
				...(fname ? fuzzySearchFilters(student.fname, fname) : []),
				...(lname ? fuzzySearchFilters(student.lname, lname) : []),
				...(index ? fuzzySearchFilters(student.index, index) : []),
			)
		)
		.groupBy(student.id, student.fname, student.lname, student.index);

	return students.map((s) => {
		const isInside = s.entryTimestamp > s.exitTimestamp;
		return {
			id: s.id,
			fname: s.fname,
			lname: s.lname,
			index: s.index,
			state: isInside ? StateInside : StateOutside
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
	// Assert fname, lname and index are not null nor undefined nor empty
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
			.returning({ id: student.id })
			.execute();

		// Create the student entry
		await tx.insert(studentEntry).values({ studentId: id }).execute();

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
	// Assert id is not null or undefined
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
		const [{ timestamp: exitTimestamp }] = await tx
			.select({
				timestamp: studentExit.timestamp
			})
			.from(studentExit)
			.where(eq(studentExit.studentId, id))
			.orderBy(desc(studentExit.timestamp))
			.limit(1);

		// Determine if the student is inside or outside
		const isInside = entryTimestamp > exitTimestamp;

		return isInside ? StateInside : StateOutside;
	});
}

// Toggles the state of a student (inside to outside and vice versa)
export async function toggleStudentState(id: number): Promise<State> {
	// Assert id is not null or undefined
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
		const [{ timestamp: exitTimestamp }] = await tx
			.select({
				timestamp: studentExit.timestamp
			})
			.from(studentExit)
			.where(eq(studentExit.studentId, id))
			.orderBy(desc(studentExit.timestamp))
			.limit(1);

		// Determine if the student is inside or outside
		const isInside = entryTimestamp > exitTimestamp;

		// Toggle the student state
		if (isInside) {
			// Exit the student
			await tx.insert(studentExit).values({ studentId: id }).execute();
		} else {
			// Enter the student
			await tx.insert(studentEntry).values({ studentId: id }).execute();
		}

		// Determine the new state
		const newIsInside = !isInside;

		return newIsInside ? StateInside : StateOutside;
	});
}
