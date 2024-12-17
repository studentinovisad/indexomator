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
				form,
				message: 'Invalid form inputs'
			});
		}

		// Check if the secret is correct
		const secretOk = await validateSecret(form.data.secret);
		if (!secretOk) {
			return fail(401, {
				form,
				message: 'Invalid secret'
			});
		}

		try {
			const { department } = form.data;
			await createDepartment(department);
		} catch (err: unknown) {
			console.debug(`Failed to create department: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: 'Department already exists'
			});
		}

		return {
			form,
			message: 'Department created successfully!'
		};
	}
};
