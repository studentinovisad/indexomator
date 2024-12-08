import { eq } from 'drizzle-orm';
import { userTable } from './schema/user';
import { hashPassword } from '../password';
import type { Database } from './connect';

export async function createUser(db: Database, username: string, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.insert(userTable).values({
		username,
		passwordHash
	});
}

export async function getUserIdAndPasswordHash(
	db: Database,
	username: string
): Promise<{ id: number; passwordHash: string }> {
	const [{ id, passwordHash }] = await db
		.select({
			id: userTable.id,
			passwordHash: userTable.passwordHash
		})
		.from(userTable)
		.where(eq(userTable.username, username));
	return {
		id,
		passwordHash
	};
}
