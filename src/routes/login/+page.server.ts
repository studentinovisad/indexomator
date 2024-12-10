import { createSession, generateSessionToken } from '$lib/server/db/session';
import { getUserIdAndPasswordHash } from '$lib/server/db/user';
import { verifyPasswordHash } from '$lib/server/password';
import { setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	try {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// Check if the username and password are valid
		if (
			username === null ||
			password === null ||
			username === undefined ||
			password === undefined ||
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			username === '' ||
			password === ''
		) {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}

		// Check if the username and password are valid
		const { id, passwordHash } = await getUserIdAndPasswordHash(username);
		const validPassword = await verifyPasswordHash(passwordHash, password);
		if (!validPassword) {
			return fail(401, {
				message: 'Invalid username or password'
			});
		}

		// Create a new session token
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		// Redirect to the home page
		return redirect(302, '/');
	} catch (err: any) {
		const msg = `Failed to login: ${err.message}`;
		console.log(msg);
		return fail(400, {
			message: msg
		});
	}
}
