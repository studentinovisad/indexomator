import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { createGuest, getGuarantors } from '$lib/server/db/person';
import { getUniversities } from '$lib/server/db/university';

import { createFormSchema, guarantorSearchFormSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { database } }) => {
	const createForm = await superValidate(zod(createFormSchema));
	const guarantorSearchForm = await superValidate(zod(guarantorSearchFormSchema));

	try {
		const universitiesP = getUniversities(database);
		const guarantorsP = getGuarantors(database, 10);

		const universities = await universitiesP;
		const guarantors = await guarantorsP;

		return {
			createForm,
			guarantorSearchForm,
			universities,
			guarantors
		};
	} catch (err: unknown) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	create: async ({ locals: { database, session, user }, request }) => {
		const createForm = await superValidate(request, zod(createFormSchema));
		if (!createForm.valid) {
			return fail(400, {
				createForm,
				message: 'Invalid form inputs'
			});
		}

		if (session === null || user === null) {
			return fail(401, {
				createForm,
				message: 'Invalid session'
			});
		}

		const { identifier, fname, lname, university, guarantorId } = createForm.data;
		const { building } = session;
		const { username: creator } = user;

		try {
			await createGuest(
				database,
				identifier,
				fname,
				lname,
				university,
				building,
				creator,
				guarantorId
			);

			return {
				createForm,
				message: 'Successfully created guest!'
			};
		} catch (err: unknown) {
			return fail(400, {
				createForm,
				message: `Failed to create guest: ${(err as Error).message}`
			});
		}
	},
	guarantorSearch: async ({ locals: { database }, request }) => {
		const guarantorSearchForm = await superValidate(request, zod(guarantorSearchFormSchema));
		if (!guarantorSearchForm.valid) {
			return fail(400, {
				guarantorSearchForm,
				message: 'Invalid form inputs'
			});
		}

		const { guarantorSearchQuery: searchQuery } = guarantorSearchForm.data;

		try {
			const guarantors = await getGuarantors(database, 10, {
				searchQuery
			});

			return {
				guarantorSearchForm,
				guarantors
			};
		} catch (err: unknown) {
			return fail(500, {
				guarantorSearchForm,
				message: `Failed to search: ${(err as Error).message}`
			});
		}
	}
};
