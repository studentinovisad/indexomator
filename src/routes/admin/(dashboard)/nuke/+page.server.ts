import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getBuildings } from '$lib/server/db/building';
import { getPersonTypes, removePersonsFromBuilding } from '$lib/server/db/person';

export const load: PageServerLoad = async ({ locals: { database } }) => {
	const form = await superValidate(zod(formSchema));

	try {
		const buildingsP = getBuildings(database);
		const personTypesP = getPersonTypes(database);

		const buildings = await buildingsP;
		const personTypes = await personTypesP;

		return {
			form,
			buildings,
			personTypes
		};
	} catch (err) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	default: async ({ locals: { database }, request }) => {
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Invalid form inputs'
			});
		}

		const { building, personType } = form.data;

		try {
			await removePersonsFromBuilding(database, building, personType);

			return {
				form,
				message: 'Successfully nuked building! 💥'
			};
		} catch (err) {
			return fail(500, {
				form,
				message: `Failed to nuke building: ${(err as Error).message}`
			});
		}
	}
};
