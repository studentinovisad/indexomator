import { updateUserDisabled, updateAllUserDisabled } from '$lib/server/db/user';
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

		const { username, action } = formOne.data;
		const newDisable = action === 'disable';

		try {
			await updateUserDisabled(database, username, newDisable);
		} catch (err) {
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

		const { action } = formAll.data;
		const newDisable = action === 'disable';

		try {
			await updateAllUserDisabled(database, newDisable);
		} catch (err) {
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
