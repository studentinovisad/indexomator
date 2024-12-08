import { validateSessionToken } from '$lib/server/db/session';
import { setSessionTokenCookie, deleteSessionTokenCookie } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit'; // To handle redirection

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;

	// If no token exists, set user and session to null
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		// Redirect to the login page (or whatever page makes sense for unauthenticated users)
		if (event.url.pathname !== '/login' && event.url.pathname !== '/register') {
			return redirect(302, '/login');
		}
		return resolve(event);
	}

	// Validate session token
	const { session, user } = await validateSessionToken(token);
	if (session !== null) {
		// If session is valid, ensure the token is up-to-date
		setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		// If session is invalid, delete the session cookie
		deleteSessionTokenCookie(event);
		// Redirect to the login page after session expiry
		if (event.url.pathname !== '/login') {
			return redirect(302, '/login');
		}
	}

	// Set session and user in locals for the rest of the request
	event.locals.session = session;
	event.locals.user = user;

	// Continue with resolving the request
	return resolve(event);
};
