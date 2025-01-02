import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import type { PageServerLoad } from './$types';
import { getBuildings } from '$lib/server/db/building';
import { validateSecret } from '$lib/server/secret';
import { nukeBuilding } from '$lib/server/db/person';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));
	const buildings = await getBuildings();

	return {
		form,
		buildings
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
			const { building } = form.data;
			await nukeBuilding(building);
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
