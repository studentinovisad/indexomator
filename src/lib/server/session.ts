import type { RequestEvent } from '@sveltejs/kit';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { inactivityTimeout } from '$lib/server/env';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	const randomBytes = crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(randomBytes);
	return token;
}

const sessionCookieName = 'session';
export function setSessionTokenCookie(event: RequestEvent, token: string, timestamp: Date): void {
	event.cookies.set(sessionCookieName, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		expires: new Date(timestamp.getTime() + inactivityTimeout)
	});
}
export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.delete(sessionCookieName, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	});
}

const adminSessionCookieName = 'admin_session';
export function setAdminSessionTokenCookie(
	event: RequestEvent,
	token: string,
	timestamp: Date
): void {
	event.cookies.set(adminSessionCookieName, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		expires: new Date(timestamp.getTime() + inactivityTimeout)
	});
}
export function deleteAdminSessionTokenCookie(event: RequestEvent): void {
	event.cookies.delete(adminSessionCookieName, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	});
}
