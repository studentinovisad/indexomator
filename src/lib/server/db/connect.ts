import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';

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

	// Connect to the database
	const client = postgres(dbUrl);
	const database = drizzle(client);

	// Run migrations
	await migrate(database, {
		migrationsFolder: migrationsPath
	});

	return {
		database,
		client
	};
}

export const DB = (await connectDatabase()).database;
