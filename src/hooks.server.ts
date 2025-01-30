import { connectDatabase } from '$lib/server/db/connect';
import { validateSessionToken } from '$lib/server/db/session';
import { setSessionTokenCookie, deleteSessionTokenCookie } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Connect to database on startup
const { database } = await connectDatabase();

export const handle: Handle = async ({ event, resolve }) => {
	// Set the database in locals for the rest of the request
	event.locals.database = database;

	// Allow access to the admin pages without authentication (secret is required)
	if (event.url.pathname.startsWith('/admin')) {
		return resolve(event);
	}

	const token = event.cookies.get('session') ?? null;

	// If no token exists, set user and session to null
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		// Redirect to the login page (or whatever page makes sense for unauthenticated users)
		if (event.url.pathname !== '/login') {
			return redirect(302, '/login');
		}
		return resolve(event);
	}

	// Validate session token
	const { session, user } = await validateSessionToken(database, token);
	if (session !== null && !user.disabled) {
		// If session is valid, ensure the token is up-to-date
		setSessionTokenCookie(event, token, session.timestamp);

		// Redirect to the home page after login
		if (event.url.pathname === '/login') {
			return redirect(302, '/');
		}
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
