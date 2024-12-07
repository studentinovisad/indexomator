// import dotenv from 'dotenv';
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// import { createStudent, toggleStudentState } from '../student';
// import { createEmployee, toggleEmployeeState } from '../employee';
// import { sleep } from '$lib/utils/sleep';

// // Load environment variables
// dotenv.config();

// // Configure your database connection
// if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
// const client = postgres(process.env.DATABASE_URL);
// const db = drizzle(client);

// async function seedDatabase() {
// 	try {
// 		// Create some students...
// 		await createStudent('John', 'Doe', '1/01');
// 		await createStudent('Jane', 'Doe', '1/02');
// 		await createStudent('Alice', 'Smith', '1/03');
// 		await createStudent('Bob', 'Smith', '1/04');
// 		await createStudent('Charlie', 'Brown', '1/05');

// 		// Create some employees...
// 		await createEmployee('John', 'Doe', '123456781');
// 		await createEmployee('Jane', 'Doe', '123456782');
// 		await createEmployee('Alice', 'Smith', '123456783');
// 		await createEmployee('Bob', 'Smith', '123456784');
// 		await createEmployee('Charlie', 'Brown', '123456785');

// 		// Toggle states for students...
// 		await toggleStudentState(1);
// 		sleep(1000);
// 		await toggleStudentState(2);
// 		sleep(2000);
// 		await toggleStudentState(3);

// 		// Toggle states for employees...
// 		sleep(3000);
// 		await toggleEmployeeState(4);
// 		sleep(1000);
// 		await toggleEmployeeState(5);

// 		console.log('Seeding completed successfully.');
// 	} catch (error) {
// 		console.error('Error seeding database:', error);
// 	} finally {
// 		await client.end(); // Close the database connection
// 	}
// }

// seedDatabase();
