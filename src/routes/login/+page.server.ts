import { createSession, invalidateExcessSessions } from '$lib/server/db/session';
import { checkUserRatelimit, getUserIdAndPasswordHash, isUserDisabled } from '$lib/server/db/user';
import { verifyPasswordHash } from '$lib/server/password';
import { generateSessionToken, setSessionTokenCookie } from '$lib/server/session';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { logInFormSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getBuildings } from '$lib/server/db/building';
import { ratelimitMaxAttempts, ratelimitTimeout } from '$lib/server/env';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { database } = locals;

	const logInForm = await superValidate(zod(logInFormSchema));

	const messageType = url.searchParams.get('messageType');
	const messageText = url.searchParams.get('messageText');

	try {
		const buildings = await getBuildings(database);

		return {
			logInForm,
			buildings,
			messageType,
			messageText
		};
	} catch (err) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	default: async (event) => {
		const {
			locals: { database },
			request
		} = event;

		const logInForm = await superValidate(request, zod(logInFormSchema));
		if (!logInForm.valid) {
			return fail(400, {
				logInForm,
				message: 'Invalid form inputs'
			});
		}

		const { username, password, building } = logInForm.data;

		try {
			// Check if the username exists
			const { id, passwordHash } = await getUserIdAndPasswordHash(database, username);

			// Check if the ratelimit has been hit
			const ratelimited = await checkUserRatelimit(
				database,
				id,
				ratelimitMaxAttempts,
				ratelimitTimeout
			);
			if (ratelimited) {
				console.warn(`Ratelimited by IP: ${event.getClientAddress()}`);
				return fail(401, {
					logInForm,
					message: `Ratelimited, please wait ${ratelimitTimeout}s before trying again`
				});
			}

			// Check if the password matches
			const validPassword = await verifyPasswordHash(passwordHash, password);
			if (!validPassword) {
				throw new Error('Incorrect password');
			}

			if (await isUserDisabled(database, id)) {
				throw new Error('user is disabled: contact the administrator');
			}

			// Create a new session token
			const sessionToken = generateSessionToken();
			const session = await createSession(database, sessionToken, id, building);
			setSessionTokenCookie(event, sessionToken, session.timestamp);

			// Invalidate sessions that exceed the maximum number of sessions
			await invalidateExcessSessions(database, id);
		} catch (err) {
			// WARN: Don't return the real error message back to user since this is publicly available
			console.warn(`Failed to login: ${(err as Error).message}`);
			return fail(401, {
				logInForm,
				message: 'Invalid username or password'
			});
		}

		// Has to be outside of try-catch because it throws a redirect
		return redirect(302, '/');
	}
};
