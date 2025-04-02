import { connectDatabase } from '$lib/server/db/connect';
import { isUserScheduled } from '$lib/server/db/schedule';
import { validateAdminSessionToken, validateSessionToken } from '$lib/server/db/session';
import {
	setSessionTokenCookie,
	deleteSessionTokenCookie,
	setAdminSessionTokenCookie,
	deleteAdminSessionTokenCookie
} from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Connect to database on startup
const { database } = await connectDatabase();

export const handle: Handle = async ({ event, resolve }) => {
	// Set the database in locals for the rest of the request
	event.locals.database = database;

	// Use admin session for admin routes
	if (event.url.pathname.startsWith('/admin')) {
		const token = event.cookies.get('admin_session');

		// If no token exists, set admin session to null
		if (token === undefined) {
			event.locals.adminSession = null;
			// Redirect to the login page
			if (event.url.pathname !== '/admin/login') {
				return redirect(302, '/admin/login');
			}
			return resolve(event);
		}

		// Validate admin session token
		const adminSession = await validateAdminSessionToken(database, token);
		if (adminSession !== null) {
			// If admin session is valid, ensure the token is up-to-date
			setAdminSessionTokenCookie(event, token, adminSession.timestamp);

			// Redirect to the admin home page after login
			if (event.url.pathname === '/admin/login') {
				return redirect(302, '/admin');
			}
		} else {
			// If admin session is invalid, delete the session cookie
			deleteAdminSessionTokenCookie(event);

			// Redirect to the admin login page after admin session expiry
			if (event.url.pathname !== '/admin/login') {
				return redirect(302, '/admin/login');
			}
		}

		// Set admin session in locals for the rest of the request
		event.locals.adminSession = adminSession;

		// Continue with resolving the request
		return resolve(event);
	} else {
		const token = event.cookies.get('session');

		// If no token exists, set user and session to null
		if (token === undefined) {
			event.locals.user = null;
			event.locals.session = null;
			// Redirect to the login page
			if (event.url.pathname !== '/login') {
				return redirect(302, '/login');
			}
			return resolve(event);
		}

		// Validate session token
		const { session, user } = await validateSessionToken(database, token);
		if (session !== null && !user.disabled && await isUserScheduled(database, user.id)) {
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
	}
};
