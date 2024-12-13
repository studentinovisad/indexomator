import { fail, type Actions } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { createDepartment } from '$lib/server/db/department';
import { validateSecret } from '$lib/server/secret';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

	return {
		form
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

		// Check if the secret is correct
		if (!validateSecret(form.data.secret)) {
			return fail(401, {
				form,
				message: 'Invalid secret'
			});
		}

		try {
			const { department } = form.data;
			await createDepartment(department);
		} catch (err: unknown) {
			const message = `Failed to create department: ${(err as Error).message}}`;
			console.debug(message);
			return fail(400, {
				form,
				message
			});
		}

		return message(form, 'Department created successfully!');
	}
};
