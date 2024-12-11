import dotenv from 'dotenv';
import { student, studentEntry } from '../schema/student';
import { connectDatabaseWithURL } from '../connect_generic';
import { sanitizeString } from '$lib/utils/sanitize';
import { StateInside } from '$lib/types/state';

// Load environment variables
dotenv.config();

async function seedDatabase() {
	const dbUrl = process.env.DATABASE_URL;
	// Assert that the DATABASE_URL environment variable is set
	if (!dbUrl) throw new Error('DATABASE_URL is not set');

	const migrationsPath = process.env.MIGRATIONS_PATH;
	// Assert that the MIGRATIONS_PATH environment variable is set
	if (!migrationsPath) throw new Error('MIGRATIONS_PATH is not set');

	const firstStudentIndex = process.env.FIRST_STUDENT_INDEX;
	// Assert that the FIRST_STUDENT_INDEX environment variable is set
	if (!firstStudentIndex) throw new Error('FIRST_STUDENT_INDEX is not set');

	const firstStudentFirstName = process.env.FIRST_STUDENT_FIRST_NAME;
	// Assert that the FIRST_STUDENT_FIRST_NAME environment variable is set
	if (!firstStudentFirstName) throw new Error('FIRST_STUDENT_FIRST_NAME is not set');

	const firstStudentLastName = process.env.FIRST_STUDENT_LAST_NAME;
	// Assert that the FIRST_STUDENT_LAST_NAME environment variable is set
	if (!firstStudentLastName) throw new Error('FIRST_STUDENT_LAST_NAME is not set');

	// Connect to the database
	const { database: db, client } = await connectDatabaseWithURL(dbUrl, migrationsPath);

	try {
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
		const fname = sanitizeString(firstStudentFirstName);
		const lname = sanitizeString(firstStudentLastName);

		try {
			const res = await db.transaction(async (tx) => {
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
			console.log('Production seeding completed successfully.');
			return res;
		} catch (err: any) {
			throw new Error(`Failed to create student in database: ${JSON.stringify(err)}`);
		}
	} catch (error) {
		console.error('Error seeding database:', error);
	} finally {
		await client.end(); // Close the database connection
	}
}

seedDatabase();
