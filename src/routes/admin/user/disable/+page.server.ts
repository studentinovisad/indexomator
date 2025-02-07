import { updateUserDisabled, updateAllUserDisabled } from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formOneSchema, formAllSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const formOne = await superValidate(zod(formOneSchema));
	const formAll = await superValidate(zod(formAllSchema));

	return {
		formOne,
		formAll
	};
};

export const actions: Actions = {
	single: async ({ locals: { database }, request }) => {
		const formOne = await superValidate(request, zod(formOneSchema));
		if (!formOne.valid) {
			return fail(400, {
				formOne,
				message: 'Invalid form inputs'
			});
		}

		const { username, secret, action } = formOne.data;
		const newDisable = action === 'disable';

		// Check if the secret is correct
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				formOne,
				message: 'Invalid secret'
			});
		}

		try {
			await updateUserDisabled(database, username, newDisable);
		} catch (err: unknown) {
			console.debug(`Failed to ${action} user: ${(err as Error).message}`);
			return fail(400, {
				formOne,
				message: `Failed to ${action} user: ${(err as Error).message}`
			});
		}

		return {
			formOne,
			message: `Successfully ${action}d user!`
		};
	},
	all: async ({ locals: { database }, request }) => {
		const formAll = await superValidate(request, zod(formAllSchema));
		if (!formAll.valid) {
			return fail(400, {
				formAll,
				message: 'Invalid form inputs'
			});
		}

		const { secret, action } = formAll.data;
		const newDisable = action === 'disable';

		// Check if the secret is correct
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				formAll,
				message: 'Invalid secret'
			});
		}

		try {
			await updateAllUserDisabled(database, newDisable);
		} catch (err: unknown) {
			console.debug(`Failed to ${action} all users: ${(err as Error).message}`);
			return fail(400, {
				formAll,
				message: `Failed to ${action} all users: ${(err as Error).message}`
			});
		}

		return {
			formAll,
			message: `Successfully ${action}d all users!`
		};
	}
};
