import { createUser } from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

	return { form };
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
			const { username, password } = form.data;
			// Create the new user
			await createUser(username, password);
		} catch (err: unknown) {
			const message = `Failed to register: ${(err as Error).message}}`;
			console.log(message);
			return fail(400, {
				form,
				message
			});
		}
	}
};

