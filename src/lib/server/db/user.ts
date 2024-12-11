import { eq } from 'drizzle-orm';
import { userTable } from './schema/user';
import { hashPassword, verifyPasswordStrength } from '../password';
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

	// Check the strength of the password
	const strong = await verifyPasswordStrength(password);
	if (!strong) {
		throw new Error('Password is too weak');
	}

	try {
		const passwordHash = await hashPassword(password);
		await db.insert(userTable).values({
			username,
			passwordHash
		});
	} catch (err: any) {
		throw new Error(`Failed to create user in database: ${JSON.stringify(err)}`);
	}
}

export async function getUserIdAndPasswordHash(
	username: string
): Promise<{ id: number; passwordHash: string }> {
	// Assert that username is valid
	if (username === null || username === undefined || username === '') {
		throw new Error('Invalid username');
	}

	try {
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
	} catch (err: any) {
		throw new Error(
			`Failed to get user id and password hash from database: ${JSON.stringify(err)}`
		);
	}
}
