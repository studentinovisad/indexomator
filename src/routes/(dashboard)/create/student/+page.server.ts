import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { createStudent, createStudentRectorateMode } from '$lib/server/db/person';
import { getDepartments } from '$lib/server/db/department';

import { createFormSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getUniversities } from '$lib/server/db/university';
import { rectorateMode } from '$lib/utils/env';

export const load: PageServerLoad = async ({ locals }) => {
	const { database } = locals;

	const createForm = await superValidate(zod(createFormSchema));

	try {
		const departmentsP = getDepartments(database);
		const universitiesP = getUniversities(database);

		const departments = await departmentsP;
		const universities = await universitiesP;

		return {
			createForm,
			departments,
			universities
		};
	} catch (err: unknown) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const { database } = locals;

		const createForm = await superValidate(request, zod(createFormSchema));
		if (!createForm.valid) {
			return fail(400, {
				createForm,
				message: 'Invalid form inputs'
			});
		}

		if (locals.session === null || locals.user === null) {
			return fail(401, {
				createForm,
				message: 'Invalid session'
			});
		}

		const { identifier, fname, lname, department, university } = createForm.data;
		const building = locals.session.building;
		const creator = locals.user.username;

		try {
			if (rectorateMode) {
				await createStudentRectorateMode(
					database,
					identifier,
					fname,
					lname,
					university,
					building,
					creator
				);
			} else {
				await createStudent(database, identifier, fname, lname, department, building, creator);
			}

			return {
				createForm,
				message: 'Successfully created student!'
			};
		} catch (err: unknown) {
			return fail(400, {
				createForm,
				message: `Failed to create student: ${(err as Error).message}`
			});
		}
	}
};
