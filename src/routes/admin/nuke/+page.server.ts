import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getBuildings } from '$lib/server/db/building';
import { validateSecret } from '$lib/server/secret';
import { getPersonTypes, removePersonsFromBuilding } from '$lib/server/db/person';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));
	const buildingsP = getBuildings();
	const personTypesP = getPersonTypes();
	const buildings = await buildingsP;
	const personTypes = await personTypesP;

	return {
		form,
		buildings,
		personTypes
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));
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
			const { building, personType } = form.data;
			await removePersonsFromBuilding(building, personType);
		} catch (err: unknown) {
			console.debug(`Failed to nuke building: ${(err as Error).message}`);
			return fail(400, {
				form,
				message: `Failed to nuke building: ${(err as Error).message}`
			});
		}

		return {
			form,
			message: 'Building nuked successfully! 💥'
		};
	}
};
