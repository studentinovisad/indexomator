import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { createDepartment } from '$lib/server/db/department';

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

		const { department } = form.data;

		try {
			await createDepartment(database, department);

			return {
				form,
				message: 'Successfully created department!'
			};
		} catch (err) {
			return fail(500, {
				form,
				message: `Failed to create department: ${(err as Error).message}`
			});
		}
	}
};
