import { fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { adminLogInFormSchema } from './schema';

import type { PageServerLoad } from './$types';

import { validateSecret } from '$lib/server/secret';
import { generateSessionToken, setAdminSessionTokenCookie } from '$lib/server/session';
import { createAdminSession } from '$lib/server/db/session';

export const load: PageServerLoad = async () => {
	const adminLogInForm = await superValidate(zod(adminLogInFormSchema));

	return {
		adminLogInForm
	};
};

export const actions: Actions = {
	default: async (event) => {
		const {
			locals: { database },
			request
		} = event;

		const adminLogInForm = await superValidate(request, zod(adminLogInFormSchema));
		if (!adminLogInForm.valid) {
			return fail(400, {
				adminLogInForm,
				message: 'Invalid form inputs'
			});
		}

		// Check if the secret matches
		const { secret } = adminLogInForm.data;
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				adminLogInForm,
				message: 'Invalid secret'
			});
		}

		try {
			// Create a new session token
			const sessionToken = generateSessionToken();
			const session = await createAdminSession(database, sessionToken);
			setAdminSessionTokenCookie(event, sessionToken, session.timestamp);
		} catch (err) {
			return fail(500, {
				adminLogInForm,
				message: `Failed to login: ${(err as Error).message}`
			});
		}

		// Has to be outside of try-catch because it throws a redirect
		return redirect(302, '/admin');
	}
};
