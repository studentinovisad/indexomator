import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { createUniversity } from '$lib/server/db/university';

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

		const { university } = form.data;

		try {
			await createUniversity(database, university);

			return {
				form,
				message: 'Successfully created university!'
			};
		} catch (err) {
			return fail(500, {
				form,
				message: `Failed to create university: ${(err as Error).message}`
			});
		}
	}
};
