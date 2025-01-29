import { getUserIdAndPasswordHash, updateUserDisabled } from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
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
	disable: async (event) => {
		const { locals, request } = event;
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
			const { username } = form.data;
			const { id } = await getUserIdAndPasswordHash(database, username);
			await updateUserDisabled(database, id, true);
		} catch (err: unknown) {
			console.debug(`Failed to disable user ${form.data.username}: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: 'username does not exist'
			});
		}

		return {
			form,
			message: 'User disabled!'
		};
	},
	enable: async (event) => {
		const { locals, request } = event;
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
			const { username } = form.data;
			const { id } = await getUserIdAndPasswordHash(database, username);
			await updateUserDisabled(database, id, false);
		} catch (err: unknown) {
			console.debug(`Failed to enable user ${form.data.username}: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: 'username does not exist'
			});
		}

		return {
			form,
			message: 'User enabled!'
		};
	}
};
