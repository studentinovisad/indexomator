import type { RequestEvent } from '@sveltejs/kit';
import { inactivityTimeout } from './db/session';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export function setSessionTokenCookie(event: RequestEvent, token: string, timestamp: Date): void {
	event.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: new Date(timestamp.getTime() + inactivityTimeout),
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	});
}
