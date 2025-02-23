import { createUser } from '$lib/server/db/user';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ locals: { database }, request }) => {
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Invalid form inputs'
			});
		}

		const { username, password } = form.data;

		try {
			await createUser(database, username, password);

			return {
				form,
				message: 'Successfully registered user!'
			};
		} catch (err) {
			return fail(400, {
				form,
				message: `Failed to register: ${(err as Error).message}`
			});
		}
	}
};
