import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getPersons, setPersonBannedStatus } from '$lib/server/db/person';
import { banFormSchema, searchFormSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { database } }) => {
	const banForm = await superValidate(zod(banFormSchema));
	const searchForm = await superValidate(zod(searchFormSchema));

	const persons = await getPersons(database, 10, 0);

	return {
		banForm,
		searchForm,
		persons
	};
};

export const actions: Actions = {
	ban: async ({ locals, request }) => {
		const { database } = locals;
		const banForm = await superValidate(request, zod(banFormSchema));
		if (!banForm.valid) {
			return fail(400, {
				banForm,
				message: 'Invalid form inputs'
			});
		}

		const { personId, action } = banForm.data;
		const actionMsg = action === 'ban' ? 'banned' : 'pardoned';

		try {
			await setPersonBannedStatus(database, personId, action);
		} catch (err) {
			return fail(400, {
				banForm,
				message: `Failed to ${action} student: ${(err as Error).message}`
			});
		}

		return {
			banForm,
			message: `Person ${actionMsg} successfully!`
		};
	},
	search: async ({ locals: { database }, request }) => {
		const searchForm = await superValidate(request, zod(searchFormSchema));
		if (!searchForm.valid) {
			return fail(400, {
				searchForm,
				message: 'Invalid form inputs'
			});
		}

		const { searchQuery } = searchForm.data;

		try {
			const persons = await getPersons(database, 10, 0, {
				searchQuery
			});

			return {
				searchForm,
				persons
			};
		} catch (err) {
			return fail(500, {
				searchForm,
				message: `Failed to search: ${(err as Error).message}`
			});
		}
	}
};
