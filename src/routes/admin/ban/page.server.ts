import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
// import type { PageServerLoad } from './$types';
import { getPersons, banPerson } from '$lib/server/db/person';
import { validateSecret } from '$lib/server/secret';

export const load = async ({ locals }) => {
	const { database } = locals;
	const form = await superValidate(zod(formSchema));
	const studentsP = getPersons(database, 10, 0);
	const students = await studentsP;

	return {
		form,
		students
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
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
			const { student } = form.data;
			await banPerson(database, student);
		} catch (err: unknown) {
			console.debug(`Failed to ban student: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: `Failed to ban student: ${(err as Error).message}`
			});
		}

		return {
			form,
			message: 'Student banned successfully! 🚫'
		};
	}
};
