import { eq } from 'drizzle-orm';
import { db } from '.';
import { userTable } from './schema/user';

export async function getUserIdAndPasswordHash(
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
