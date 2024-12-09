import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { sleep } from '$lib/utils/sleep';

export type Database = PostgresJsDatabase<Record<string, never>>;
export type Client = postgres.Sql<{}>;

// Connects to the database using the DATABASE_URL environment variable
export async function connectDatabase(): Promise<{ database: Database; client: Client }> {
	const dbUrl = env.DATABASE_URL;
	// Assert that the DATABASE_URL environment variable is set
	if (!dbUrl) throw new Error('DATABASE_URL is not set');

	const migrationsPath = env.MIGRATIONS_PATH;
	// Assert that the MIGRATIONS_PATH environment variable is set
	if (!migrationsPath) throw new Error('MIGRATIONS_PATH is not set');

	return await connectDatabaseWithURL(dbUrl, migrationsPath);
}

// Connects to the database using the provided URL
export async function connectDatabaseWithURL(
	dbUrl: string,
	migrationsPath: string
): Promise<{ database: Database; client: Client }> {
	// Assert non-null and non-empty dbUrl and migrationsPath
	if (!dbUrl) throw new Error('dbUrl is required');
	if (!migrationsPath) throw new Error('migrationsPath is required');

	console.log('Connecting to database:', dbUrl);
	console.log('Running migrations from:', migrationsPath);

	const maxAttempts = 10; // Maximum retry attempts (1 attempt per second)
	const delayMs = 1000; // Delay between attempts (1 second)

	let attempts = 0;

	// Helper function to attempt the database connection
	const tryConnect = async (): Promise<{ database: Database; client: Client }> => {
		attempts++;
		try {
			// Connect to the database
			const client = postgres(dbUrl);
			const database = drizzle(client);

			// Run migrations
			await migrate(database, { migrationsFolder: migrationsPath });

			return { database, client };
		} catch (error) {
			if (attempts >= maxAttempts) {
				throw new Error('Database connection failed after 10 seconds');
			}
			console.log(
				`Connection attempt ${attempts} failed. Retrying in ${delayMs / 1000} second(s)...`
			);
			sleep(delayMs); // Wait before retrying
			return tryConnect(); // Recursively retry the connection
		}
	};

	// Start the connection attempt
	return tryConnect();
}

export const DB = (await connectDatabase()).database;
