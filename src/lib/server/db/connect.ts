import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { connectDatabaseWithURL } from './connect_generic';
import { student, studentEntry } from './schema/student';
import { capitalizeString, sanitizeString } from '$lib/utils/sanitize';
import { StateInside } from '$lib/types/state';

export type Database = PostgresJsDatabase<Record<string, never>>;
export type Client = postgres.Sql<{}>;

// Connects to the database using the DATABASE_URL environment variable
export async function connectDatabase(): Promise<{
	database: Database | null;
	client: Client | null;
}> {
	const stage = env.STAGE;
	// Return immediately if the stage is build
	if (stage === 'build') {
		return { database: null, client: null };
	}

	const dbUrl = env.DATABASE_URL;
	// Assert that the DATABASE_URL environment variable is set
	if (!dbUrl) throw new Error('DATABASE_URL is not set');

	const migrationsPath = env.MIGRATIONS_PATH;
	// Assert that the MIGRATIONS_PATH environment variable is set
	if (!migrationsPath) throw new Error('MIGRATIONS_PATH is not set');

	const { database, client } = await connectDatabaseWithURL(dbUrl, migrationsPath);

	// Bootstrap the first student if the student table is empty
	const students = await database.select({ id: student.id }).from(student);
	if (students.length === 0) {
		console.log('Bootstrapping the first student');

		const firstStudentIndex = env.FIRST_STUDENT_INDEX;
		// Assert that the FIRST_STUDENT_INDEX environment variable is set
		if (!firstStudentIndex) throw new Error('FIRST_STUDENT_INDEX is not set');

		const firstStudentFirstName = env.FIRST_STUDENT_FIRST_NAME;
		// Assert that the FIRST_STUDENT_FIRST_NAME environment variable is set
		if (!firstStudentFirstName) throw new Error('FIRST_STUDENT_FIRST_NAME is not set');

		const firstStudentLastName = env.FIRST_STUDENT_LAST_NAME;
		// Assert that the FIRST_STUDENT_LAST_NAME environment variable is set
		if (!firstStudentLastName) throw new Error('FIRST_STUDENT_LAST_NAME is not set');

		// Assert fname, lname and index are valid
		if (
			firstStudentIndex === null ||
			firstStudentIndex === undefined ||
			firstStudentIndex === '' ||
			firstStudentFirstName === null ||
			firstStudentFirstName === undefined ||
			firstStudentFirstName === '' ||
			firstStudentLastName === null ||
			firstStudentLastName === undefined ||
			firstStudentLastName === ''
		) {
			throw new Error('Invalid student data');
		}

		const index = sanitizeString(firstStudentIndex);
		const fname = capitalizeString(sanitizeString(firstStudentFirstName));
		const lname = capitalizeString(sanitizeString(firstStudentLastName));

		await database.transaction(async (tx) => {
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
				state: StateInside // Because the student was just created, they are inside
			};
		});

		console.log('Bootstrapped the first student');
	} else {
		console.log('Not bootstrapping the first student');
	}

	return { database, client };
}

// WARN: Forces Database | null to become Database (problems with building)
export const DB = (await connectDatabase()).database as Database;
