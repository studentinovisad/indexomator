import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';

export async function connectDB(): Promise<PostgresJsDatabase<Record<string, never>>> {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	// Connect to the database
	const client = postgres(env.DATABASE_URL);
	const db = drizzle(client);

	// Run migrations
	await migrate(db, {
		migrationsFolder: './src/lib/server/db/migrations'
	});

	return db;
}
