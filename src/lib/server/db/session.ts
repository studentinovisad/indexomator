import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { userTable, type User } from './schema/user';
import { sessionTable, type Session } from './schema/session';
import { DB as db } from './connect';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userId: number, building: string): Promise<Session> {
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
		const session: Session = {
			id: sessionId,
			userId,
			building,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
		};
		await db.insert(sessionTable).values(session);
		return session;
	} catch (err: unknown) {
		throw new Error(`Failed to create session in database: ${JSON.stringify(err)}`);
	}
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
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
		if (Date.now() >= session.expiresAt.getTime()) {
			await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
			session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
			await db
				.update(sessionTable)
				.set({
					expiresAt: session.expiresAt
				})
				.where(eq(sessionTable.id, session.id));
		}
		return { session, user };
	} catch (err: unknown) {
		throw new Error(`Failed to validate session token: ${JSON.stringify(err)}`);
	}
}

export async function invalidateSession(sessionId: string): Promise<void> {
	// Assert that sessionId is valid
	if (sessionId === null || sessionId === undefined || sessionId === '') {
		throw new Error('Invalid sessionId');
	}

	try {
		await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
	} catch (err: unknown) {
		throw new Error(`Failed to invalidate session in database: ${JSON.stringify(err)}`);
	}
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
