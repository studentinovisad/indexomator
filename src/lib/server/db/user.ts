import type { Database } from './connect';
import { and, desc, eq, gt } from 'drizzle-orm';
import { ratelimitTable, userTable } from './schema/user';
import { hashPassword, verifyPasswordStrength } from '../password';

// If more files make checks like this
// move it to util and export.
function assertValidString(it: string, msg: string): void {
	if (it === undefined || it === null || it === '') {
		throw new Error(msg);
	}
}

function assertValidUserId(id: number): void {
	if (id === undefined || id === null) {
		throw new Error('Invalid user id');
	}
}

export async function createUser(db: Database, username: string, password: string): Promise<void> {
	assertValidString(username, 'Invalid username');
	assertValidString(password, 'Invalid password');

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
	assertValidString(username, 'Invalid username');

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
	assertValidUserId(userId);

	// Assert that ratelimitMaxAttempts is valid
	if (
		ratelimitMaxAttempts === null ||
		ratelimitMaxAttempts === undefined ||
		ratelimitMaxAttempts <= 0
	) {
		throw new Error('Invalid ratelimitMaxAttempts');
	}

	// Assert that ratelimitTimeout is valid
	if (ratelimitTimeout === null || ratelimitTimeout === undefined || ratelimitTimeout <= 0) {
		throw new Error('Invalid ratelimitTimeout');
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

export async function isUserDisabled(db: Database, userId: number): Promise<boolean> {
	assertValidUserId(userId);

	try {
		const [{ disabled }] = await db
			.select({
				disabled: userTable.disabled
			})
			.from(userTable)
			.where(eq(userTable.id, userId));

		return disabled;
	} catch (err: unknown) {
		throw new Error(`failed getting user status: ${(err as Error).message}`);
	}
}

export async function updateUserDisabled(
	db: Database,
	userId: number,
	newDisabled: boolean
): Promise<void> {
	assertValidUserId(userId);

	try {
		await db
			.update(userTable)
			.set({
				disabled: newDisabled
			})
			.where(eq(userTable.id, userId));
	} catch (err: unknown) {
		throw new Error(`Couldn't update user.disabled: ${(err as Error).message}`);
	}
}
