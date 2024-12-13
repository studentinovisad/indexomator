import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { connectDatabaseWithURL } from './connect_generic';

export type Database = PostgresJsDatabase<Record<string, never>>;
export type Client = postgres.Sql<{}>;

// Connects to the database using the DATABASE_URL environment variable
export async function connectDatabase(): Promise<{
	database: Database | null;
	client: Client | null;
}> {
	const stage = env.STAGE;
	// WARN: Return immediately if the stage is build
	// TODO: Why is this needed JS lords???
	if (stage === 'build') {
		return { database: null, client: null };
	}

	const dbUrl = env.DATABASE_URL;
	// Assert that the DATABASE_URL environment variable is set
	if (!dbUrl) throw new Error('DATABASE_URL is not set');

	const migrationsPath = env.MIGRATIONS_PATH;
	// Assert that the MIGRATIONS_PATH environment variable is set
	if (!migrationsPath) throw new Error('MIGRATIONS_PATH is not set');

	return await connectDatabaseWithURL(dbUrl, migrationsPath);
}

// WARN: Forces Database | null to become Database (problems with building)
export const DB = (await connectDatabase()).database as Database;
