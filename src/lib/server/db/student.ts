import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '.';
import { student, studentEntry, studentExit } from './schema/student';
import { StateInside, StateOutside, type State } from '$lib/types/state';
import { isInside } from '../isInside';

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
			exitTimestamp: sql<Date | null>`MAX(${studentExit.timestamp})`.as('exitTimestamp')
		})
		.from(student)
		.leftJoin(studentEntry, eq(student.id, studentEntry.studentId))
		.leftJoin(studentExit, eq(student.id, studentExit.studentId))
		.where(
			and(
				fname ? eq(student.fname, fname) : undefined,
				lname ? eq(student.lname, lname) : undefined,
				index ? eq(student.index, index) : undefined
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
