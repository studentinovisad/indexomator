import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { banPerson } from '$lib/server/db/person';
import { validateSecret } from '$lib/server/secret';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

	return {
		form
	};
};

export const actions: Actions = {
	ban: async ({ locals, request }) => {
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
			const { identifier } = form.data;
			await banPerson(database, identifier, form.data.action === 'ban');
		} catch (err: unknown) {
			console.debug(`Failed to ban student: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: `Failed to ban student: ${(err as Error).message}`
			});
		}

		return {
			form,
			message: 'Person banned successfully! 🚫'
		};
	}
};
