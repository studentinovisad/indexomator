import type { Database } from './connect';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { userTable, type User } from './schema/user';
import { sessionTable, type Session } from './schema/session';
import { env } from '$env/dynamic/private';

export const inactivityTimeout = Number.parseInt(env.INACTIVITY_TIMEOUT ?? '120') * 60 * 1000;
export const maxActiveSessions = Number.parseInt(env.MAX_ACTIVE_SESSIONS ?? '3');

export async function createSession(
	db: Database,
	token: string,
	userId: number,
	building: string
): Promise<Session> {
	// Assert that token is valid
	if (token === null || token === undefined || token === '') {
		throw new Error('Invalid token');
	}

	// Assert that userId is valid
	if (userId === null || userId === undefined) {
		throw new Error('Invalid userId');
	}

	// Assert that building is valid
	if (building === null || building === undefined || building === '') {
		throw new Error('Invalid token');
	}

	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const result = await db
			.insert(sessionTable)
			.values({ id: sessionId, userId, building })
			.returning();
		if (result.length !== 1) {
			throw new Error('Insert length is not 1');
		}
		return result[0];
	} catch (err: unknown) {
		throw new Error(`Failed to create session in database: ${(err as Error).message}`);
	}
}

export async function validateSessionToken(
	db: Database,
	token: string
): Promise<SessionValidationResult> {
	// Assert that token is valid
	if (token === null || token === undefined || token === '') {
		throw new Error('Invalid token');
	}

	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const result = await db
			.select({ user: userTable, session: sessionTable })
			.from(sessionTable)
			.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
			.where(eq(sessionTable.id, sessionId));
		if (result.length < 1) {
			return { session: null, user: null };
		}
		const { user, session } = result[0];
		if (Date.now() >= session.timestamp.getTime() + inactivityTimeout) {
			await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
			return { session: null, user: null };
		} else {
			session.timestamp = new Date();
			await db
				.update(sessionTable)
				.set({
					timestamp: session.timestamp
				})
				.where(eq(sessionTable.id, session.id));
		}
		return { session, user };
	} catch (err: unknown) {
		throw new Error(`Failed to validate session token: ${(err as Error).message}`);
	}
}

export async function invalidateSession(db: Database, sessionId: string): Promise<void> {
	// Assert that sessionId is valid
	if (sessionId === null || sessionId === undefined || sessionId === '') {
		throw new Error('Invalid sessionId');
	}

	try {
		await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
	} catch (err: unknown) {
		throw new Error(`Failed to invalidate session in database: ${(err as Error).message}`);
	}
}

// Invalidate sessions that exceed the maximum number of sessions
export async function invalidateExcessSessions(db: Database, userId: number): Promise<void> {
	// Assert that userId is valid
	if (userId === null || userId === undefined) {
		throw new Error('Invalid userId');
	}

	const newestSessions = db
		.select({
			id: sessionTable.id
		})
		.from(sessionTable)
		.where(eq(sessionTable.userId, userId))
		.orderBy(desc(sessionTable.timestamp))
		.limit(maxActiveSessions);

	await db
		.delete(sessionTable)
		.where(and(eq(sessionTable.userId, userId), notInArray(sessionTable.id, newestSessions)));
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
