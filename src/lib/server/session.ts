import type { RequestEvent } from '@sveltejs/kit';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { inactivityTimeout } from '$lib/server/env';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	const randomBytes = crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(randomBytes);
	return token;
}

export function setSessionTokenCookie(
	event: RequestEvent,
	token: string,
	timestamp: Date,
	admin?: boolean
): void {
	const cookieName = admin ? 'admin_session' : 'session';
	event.cookies.set(cookieName, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		expires: new Date(timestamp.getTime() + inactivityTimeout)
	});
}

export function deleteSessionTokenCookie(event: RequestEvent, admin?: boolean): void {
	const cookieName = admin ? 'admin_session' : 'session';
	event.cookies.delete(cookieName, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	});
}
