import {
	getPersonsCountPerType,
	getPersonsCountPerBuilding,
	getPersonsCountPerDepartment,
	getPersonsCountPerUniversity
} from '$lib/server/db/person';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { database } = locals;

	try {
		const personsInsideCountP = getPersonsCountPerBuilding(database);
		const personsCountPerTypeP = getPersonsCountPerType(database);
		const personsCountPerDepartmentP = getPersonsCountPerDepartment(database);
		const personsCountPerUniversityP = getPersonsCountPerUniversity(database);

		const personsInsideCount = await personsInsideCountP;
		const personsCountPerType = await personsCountPerTypeP;
		const personsCountPerDepartment = await personsCountPerDepartmentP;
		const personsCountPerUniversity = await personsCountPerUniversityP;

		return {
			personsInsideCount,
			personsCountPerType,
			personsCountPerDepartment,
			personsCountPerUniversity
		};
	} catch (err: unknown) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	default: async ({ locals }) => {
		const { database } = locals;

		try {
			const personsInsideCountP = getPersonsCountPerBuilding(database);
			const personsCountPerTypeP = getPersonsCountPerType(database);
			const personsCountPerDepartmentP = getPersonsCountPerDepartment(database);
			const personsCountPerUniversityP = getPersonsCountPerUniversity(database);

			const personsInsideCount = await personsInsideCountP;
			const personsCountPerType = await personsCountPerTypeP;
			const personsCountPerDepartment = await personsCountPerDepartmentP;
			const personsCountPerUniversity = await personsCountPerUniversityP;

			return {
				personsInsideCount,
				personsCountPerType,
				personsCountPerDepartment,
				personsCountPerUniversity,
				message: 'Successfully refreshed statistics!'
			};
		} catch (err: unknown) {
			return fail(500, {
				message: `Failed to refresh statistics: ${(err as Error).message}`
			});
		}
	}
};
