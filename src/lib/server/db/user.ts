import type { Database } from './connect';
import { and, desc, eq, gt } from 'drizzle-orm';
import { ratelimitTable, userTable } from './schema/user';
import { hashPassword, verifyPasswordStrength } from '../password';

export async function createUser(db: Database, username: string, password: string): Promise<void> {
	// Assert that username is valid
	if (username === '') {
		throw new Error('Invalid username (empty)');
	}

	// Assert that password is valid
	if (password === '') {
		throw new Error('Invalid password (empty)');
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
	} catch (err: unknown) {
		throw new Error(`Failed to create user in database: ${(err as Error).message}`);
	}
}

export async function getUserIdAndPasswordHash(
	db: Database,
	username: string
): Promise<{ id: number; passwordHash: string }> {
	// Assert that username is valid
	if (username === '') {
		throw new Error('Invalid username (empty)');
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
	} catch (err: unknown) {
		throw new Error(
			`Failed to get user id and password hash from database: ${(err as Error).message}`
		);
	}
}

// Returns true if the user is ratelimited, otherwise false.
export async function checkUserRatelimit(
	db: Database,
	userId: number,
	ratelimitMaxAttempts: number,
	ratelimitTimeout: number
): Promise<boolean> {
	// Assert that ratelimitMaxAttempts is valid
	if (ratelimitMaxAttempts <= 0) {
		throw new Error('Invalid ratelimitMaxAttempts (negative)');
	}

	// Assert that ratelimitTimeout is valid
	if (ratelimitTimeout <= 0) {
		throw new Error('Invalid ratelimitTimeout (negative)');
	}
	const ratelimitTimeoutMS = ratelimitTimeout * 1000;

	return await db.transaction(async (tx) => {
		// Get all the timestamps for the user
		const timestamps = await tx
			.select()
			.from(ratelimitTable)
			.where(
				and(
					eq(ratelimitTable.userId, userId),
					gt(ratelimitTable.timestamp, new Date(Date.now() - ratelimitTimeoutMS))
				)
			)
			.orderBy(desc(ratelimitTable.timestamp));

		// Check if it's already locked
		if (timestamps.length > 0 && timestamps[0].lock) {
			return true;
		}

		// Check if the next attempt should get locked out
		const shouldLock = timestamps.length >= ratelimitMaxAttempts - 1;
		await tx.insert(ratelimitTable).values({
			userId,
			lock: shouldLock
		});

		return false;
	});
}
