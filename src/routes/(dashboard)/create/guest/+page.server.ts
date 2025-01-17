import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { createGuest, getPersons } from '$lib/server/db/person';
import { getUniversities } from '$lib/server/db/university';

import { formSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { database } = locals;
	const form = await superValidate(zod(formSchema));

	const universitiesP = getUniversities(database);
	const personsP = getPersons(database, 10, 0);

	const universities = await universitiesP;
	const persons = await personsP;

	return {
		form,
		universities,
		persons
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const { database } = locals;
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Invalid form inputs'
			});
		}

		if (locals.session === null || locals.user === null) {
			return fail(401, {
				form,
				message: 'Invalid session'
			});
		}

		try {
			const { identifier, fname, lname, university, guarantorId } = form.data;
			const building = locals.session.building;
			const creator = locals.user.username;
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
		} catch (err: unknown) {
			console.debug(`Failed to create guest: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: 'Guest already exists'
			});
		}

		return {
			form,
			message: 'Guest created successfully!'
		};
	},
	search: async ({ locals, request }) => {
		const { database } = locals;
		try {
			const formData = await request.formData();
			const searchQuery = formData.get('q');

			// Check if the searchQuery is valid
			if (searchQuery === null || searchQuery === undefined || typeof searchQuery !== 'string') {
				return fail(400, {
					message: 'Invalid search query'
				});
			}

			const persons = await getPersons(database, 10, 0, searchQuery);
			return {
				persons
			};
		} catch (err: unknown) {
			console.debug(`Failed to search: ${(err as Error).message}`);
			return fail(500, {
				message: 'Failed to search'
			});
		}
	}
};
