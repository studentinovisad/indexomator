import dotenv from 'dotenv';
import studentSeedData from './student';
import employeeSeedData from './employee';
import { student, studentEntry, studentExit } from '../schema/student';
import { employee, employeeEntry, employeeExit } from '../schema/employee';
import { connectDatabaseWithURL } from '../connect_generic';

// Load environment variables
dotenv.config();

async function seedDatabase() {
	const dbUrl = process.env.DATABASE_URL;
	// Assert that the DATABASE_URL environment variable is set
	if (!dbUrl) throw new Error('DATABASE_URL is not set');

	const migrationsPath = process.env.MIGRATIONS_PATH;
	// Assert that the MIGRATIONS_PATH environment variable is set
	if (!migrationsPath) throw new Error('MIGRATIONS_PATH is not set');

	// Connect to the database
	const { database: db, client } = await connectDatabaseWithURL(dbUrl, migrationsPath);

	try {
		// Insert into the student table
		await db.insert(student).values(studentSeedData.student);

		// Insert into the studentEntry table
		await db.insert(studentEntry).values(studentSeedData.studentEntry);

		// Insert into the studentExit table
		await db.insert(studentExit).values(studentSeedData.studentExit);

		// Insert into the employee table
		await db.insert(employee).values(employeeSeedData.employee);

		// Insert into the employeeEntry table
		await db.insert(employeeEntry).values(employeeSeedData.employeeEntry);

		// Insert into the employeeExit table
		await db.insert(employeeExit).values(employeeSeedData.employeeExit);

		console.debug('Seeding completed successfully.');
	} catch (error) {
		console.error('Error seeding database:', error);
	} finally {
		await client.end(); // Close the database connection
	}
}

seedDatabase();
