import { getPersonsCountPerBuilding, getPersonsCountPerDepartment } from '$lib/server/db/person';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const personsCountP = getPersonsCountPerDepartment();
		const personsInsideCountP = getPersonsCountPerBuilding();

		const personsCount = await personsCountP;
		const personsInsideCount = await personsInsideCountP;

		return {
			personsCount,
			personsInsideCount
		};
	} catch (err: unknown) {
		console.debug(`Failed to get persons: ${(err as Error).message}`);
		return fail(500, {
			message: 'Failed to get persons'
		});
	}
};
