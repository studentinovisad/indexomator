import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { createEmployee } from '$lib/server/db/person';
import { getDepartments } from '$lib/server/db/department';

import { createFormSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { database } }) => {
	const createForm = await superValidate(zod(createFormSchema));

	try {
		const departments = await getDepartments(database);

		return {
			createForm,
			departments
		};
	} catch (err: unknown) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	default: async ({ locals: { database, session, user }, request }) => {
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

		const { identifier, fname, lname, department } = createForm.data;
		const { building } = session;
		const { username: creator } = user;

		try {
			await createEmployee(database, identifier, fname, lname, department, building, creator);

			return {
				createForm,
				message: 'Successfully created employee!'
			};
		} catch (err: unknown) {
			return fail(400, {
				createForm,
				message: `Failed to create employee: ${(err as Error).message}`
			});
		}
	}
};
