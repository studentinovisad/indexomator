import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { createBuilding } from '$lib/server/db/building';
import { validateSecret } from '$lib/server/secret';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const { database } = locals;
		const form = await superValidate(request, zod(formSchema));
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
			const { building } = form.data;
			await createBuilding(database, building);
		} catch (err: unknown) {
			console.debug(`Failed to create building: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: 'Building already exists'
			});
		}

		return {
			form,
			message: 'Building created successfully!'
		};
	}
};
