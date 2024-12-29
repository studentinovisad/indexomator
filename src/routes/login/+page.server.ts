import {
	createSession,
	generateSessionToken,
	invalidateExcessSessions
} from '$lib/server/db/session';
import { checkUserRatelimit, getUserIdAndPasswordHash } from '$lib/server/db/user';
import { verifyPasswordHash } from '$lib/server/password';
import { setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getBuildings } from '$lib/server/db/building';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));
	const buildings = await getBuildings();

	return {
		form,
		buildings
	};
};

export const actions: Actions = {
	default: async (event) => {
		const ratelimitMaxAttempts = Number.parseInt(env.RATELIMIT_MAX_ATTEMPTS ?? '5');
		const ratelimitTimeout = Number.parseInt(env.RATELIMIT_TIMEOUT ?? '60');

		const form = await superValidate(event.request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Invalid form inputs'
			});
		}

		try {
			const { username, password, building } = form.data;

			// Check if the username exists
			const { id, passwordHash } = await getUserIdAndPasswordHash(username);

			// Check if the ratelimit has been hit
			const ratelimited = await checkUserRatelimit(id, ratelimitMaxAttempts, ratelimitTimeout);
			if (ratelimited) {
				console.warn(`Ratelimited by IP: ${event.getClientAddress()}`);
				return fail(401, {
					form,
					message: `Ratelimited, please wait ${ratelimitTimeout}s before trying again`
				});
			}

			// Check if the password matches
			const validPassword = await verifyPasswordHash(passwordHash, password);
			if (!validPassword) {
				throw new Error('Incorrect password');
			}

			// Create a new session token
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, id, building);
			setSessionTokenCookie(event, sessionToken, session.timestamp);

			// Invalidate sessions that exceed the maximum number of sessions
			await invalidateExcessSessions(id);
		} catch (err: unknown) {
			console.debug(`Failed to login: ${(err as Error).message}`);
			return fail(401, {
				form,
				message: 'Invalid username or password'
			});
		}

		// Redirect to the home page
		return redirect(302, '/');
	}
};
