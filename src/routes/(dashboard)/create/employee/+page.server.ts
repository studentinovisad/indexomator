import { fail, type Actions } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { createEmployee } from '$lib/server/db/employee';
import { getDepartments } from '$lib/server/db/department';

import { formSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));
	const departments = await getDepartments();

	return {
		form,
		departments
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (locals.session === null || locals.user === null) {
			return fail(400, {
				form
			});
		}

		try {
			const { email, fname, lname, department } = form.data;
			const building = locals.session.building;
			const creator = locals.user.username;
			await createEmployee(email, fname, lname, department, building, creator);
		} catch (err: unknown) {
			const message = `Failed to create employee: ${(err as Error).message}}`;
			console.debug(message);
			return fail(400, {
				form,
				message
			});
		}

		return message(form, 'Employee created successfully!');
	}
};
