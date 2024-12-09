import { eq } from 'drizzle-orm';
import { userTable } from './schema/user';
import { hashPassword } from '../password';
import { DB as db } from './connect';

export async function createUser(username: string, password: string): Promise<void> {
	// Assert that username is valid
	if (username === undefined || username === null || username === '') {
		throw new Error('Invalid username');
	}

	// Assert that password is valid
	if (password === undefined || password === null || password === '') {
		throw new Error('Invalid password');
	}

	const passwordHash = await hashPassword(password);
	await db.insert(userTable).values({
		username,
		passwordHash
	});
}

export async function getUserIdAndPasswordHash(
	username: string
): Promise<{ id: number; passwordHash: string }> {
	// Assert that username is valid
	if (username === null || username === undefined || username === '') {
		throw new Error('Invalid username');
	}

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
