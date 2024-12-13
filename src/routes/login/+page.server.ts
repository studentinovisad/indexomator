import { createSession, generateSessionToken } from '$lib/server/db/session';
import { getUserIdAndPasswordHash } from '$lib/server/db/user';
import { verifyPasswordHash } from '$lib/server/password';
import { setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getBuildings } from '$lib/server/db/building';

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
		const form = await superValidate(event.request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		try {
			const { username, password, building } = form.data;
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
			const session = await createSession(sessionToken, id, building);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (err: unknown) {
			const message = `Failed to login: ${(err as Error).message}}`;
			console.log(message);
			return fail(400, {
				form,
				message
			});
		}

		// Redirect to the home page
		return redirect(302, '/');
	}
};
