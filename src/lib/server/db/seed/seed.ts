import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import studentSeedData from './student';
import employeeSeedData from './employee';
import { student, studentEntry, studentExit } from '../schema/student';
import { employee, employeeEntry, employeeExit } from '../schema/employee';
import { userTable } from '../schema/user';
import { hashPassword } from '$lib/server/password';

// Load environment variables
dotenv.config();

// Configure your database connection
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function seedDatabase() {
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

		console.log('Seeding completed successfully.');
	} catch (error) {
		console.error('Error seeding database:', error);
	} finally {
		await client.end(); // Close the database connection
	}
}

seedDatabase();
