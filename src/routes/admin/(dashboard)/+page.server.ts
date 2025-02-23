import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { adminLogoutFormSchema } from './schema';

import { invalidateAdminSession } from '$lib/server/db/session';
import { deleteAdminSessionTokenCookie } from '$lib/server/session';

export const actions: Actions = {
	logout: async (event) => {
		const {
			locals: { database },
			request
		} = event;

		const adminLogoutForm = await superValidate(request, zod(adminLogoutFormSchema));
		if (!adminLogoutForm.valid) {
			return fail(400, {
				adminLogoutForm,
				message: 'Invalid form inputs'
			});
		}

		const { adminSessionId } = adminLogoutForm.data;

		try {
			await invalidateAdminSession(database, adminSessionId);
			deleteAdminSessionTokenCookie(event);
		} catch (err) {
			return error(500, `Failed to logout: ${(err as Error).message}`);
		}

		// Has to be outside of try-catch because it throws a redirect
		return redirect(302, '/admin/login');
	}
};
