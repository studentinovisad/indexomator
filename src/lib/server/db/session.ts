import type { Database } from './connect';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { userTable } from './schema/user';
import { adminSessionTable, sessionTable } from './schema/session';
import type { Session, AdminSession, User } from '$lib/types/db';
import { adminInactivityTimeout, inactivityTimeout, maxActiveSessions } from '$lib/server/env';

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export type AdminSessionValidationResult = AdminSession | null;

export async function createSession(
	db: Database,
	token: string,
	userId: number,
	building: string
): Promise<Session> {
	// Assert that token is valid
	if (token === '') {
		throw new Error('Invalid token (empty)');
	}

	// Assert that building is valid
	if (building === '') {
		throw new Error('Invalid building (empty)');
	}

	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const [result] = await db
			.insert(sessionTable)
			.values({ id: sessionId, userId, building })
			.returning();

		return result;
	} catch (err) {
		throw new Error(`Failed to create session in database: ${(err as Error).message}`);
	}
}

export async function createAdminSession(db: Database, token: string): Promise<AdminSession> {
	// Assert that token is valid
	if (token === '') {
		throw new Error('Invalid token (empty)');
	}

	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const [result] = await db.insert(adminSessionTable).values({ id: sessionId }).returning();

		return result;
	} catch (err) {
		throw new Error(`Failed to create admin session in database: ${(err as Error).message}`);
	}
}

export async function validateSessionToken(
	db: Database,
	token: string
): Promise<SessionValidationResult> {
	// Assert that token is valid
	if (token === '') {
		throw new Error('Invalid token (empty)');
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
		}

		session.timestamp = new Date();
		await db
			.update(sessionTable)
			.set({
				timestamp: session.timestamp
			})
			.where(eq(sessionTable.id, session.id));
		return { session, user };
	} catch (err) {
		throw new Error(`Failed to validate session token: ${(err as Error).message}`);
	}
}

export async function validateAdminSessionToken(
	db: Database,
	token: string
): Promise<AdminSessionValidationResult> {
	// Assert that token is valid
	if (token === '') {
		throw new Error('Invalid token (empty)');
	}

	try {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

		const result = await db
			.select({ adminSession: adminSessionTable })
			.from(adminSessionTable)
			.where(eq(adminSessionTable.id, sessionId));
		if (result.length < 1) {
			return null;
		}

		const { adminSession } = result[0];
		if (Date.now() >= adminSession.timestamp.getTime() + adminInactivityTimeout) {
			await db.delete(adminSessionTable).where(eq(adminSessionTable.id, adminSession.id));
			return null;
		}

		adminSession.timestamp = new Date();
		await db
			.update(adminSessionTable)
			.set({
				timestamp: adminSession.timestamp
			})
			.where(eq(adminSessionTable.id, adminSession.id));
		return adminSession;
	} catch (err) {
		throw new Error(`Failed to validate admin session token: ${(err as Error).message}`);
	}
}

export async function invalidateSession(db: Database, sessionId: string): Promise<void> {
	// Assert that sessionId is valid
	if (sessionId === '') {
		throw new Error('Invalid sessionId (empty)');
	}

	try {
		await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
	} catch (err) {
		throw new Error(`Failed to invalidate session in database: ${(err as Error).message}`);
	}
}

export async function invalidateAdminSession(db: Database, sessionId: string): Promise<void> {
	// Assert that sessionId is valid
	if (sessionId === '') {
		throw new Error('Invalid sessionId (empty)');
	}

	try {
		await db.delete(adminSessionTable).where(eq(adminSessionTable.id, sessionId));
	} catch (err) {
		throw new Error(`Failed to invalidate admin session in database: ${(err as Error).message}`);
	}
}

// Invalidate sessions that exceed the maximum number of sessions
export async function invalidateExcessSessions(db: Database, userId: number): Promise<void> {
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
