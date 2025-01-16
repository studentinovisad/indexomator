import {
	getPersonsCountPerType,
	getPersonsCountPerBuilding,
	getPersonsCountPerDepartment,
	getPersonsCountPerUniversity
} from '$lib/server/db/person';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { database } = locals;
	try {
		const personsCountPerTypeP = getPersonsCountPerType(database);
		const personsCountPerDepartmentP = getPersonsCountPerDepartment(database);
		const personsCountPerUniversityP = getPersonsCountPerUniversity(database);
		const personsInsideCountP = getPersonsCountPerBuilding(database);

		const personsCountPerType = await personsCountPerTypeP;
		const personsCountPerDepartment = await personsCountPerDepartmentP;
		const personsCountPerUniversity = await personsCountPerUniversityP;
		const personsInsideCount = await personsInsideCountP;

		return {
			personsCountPerType,
			personsCountPerDepartment,
			personsCountPerUniversity,
			personsInsideCount
		};
	} catch (err: unknown) {
		console.debug(`Failed to get statistics: ${(err as Error).message}`);
		return fail(500, {
			message: 'Failed to get statistics'
		});
	}
};

export const actions: Actions = {
	default: async ({ locals }) => {
		const { database } = locals;
		try {
			const personsCountPerTypeP = getPersonsCountPerType(database);
			const personsCountPerDepartmentP = getPersonsCountPerDepartment(database);
			const personsCountPerUniversityP = getPersonsCountPerUniversity(database);
			const personsInsideCountP = getPersonsCountPerBuilding(database);

			const personsCountPerType = await personsCountPerTypeP;
			const personsCountPerDepartment = await personsCountPerDepartmentP;
			const personsCountPerUniversity = await personsCountPerUniversityP;
			const personsInsideCount = await personsInsideCountP;

			return {
				personsCountPerType,
				personsCountPerDepartment,
				personsCountPerUniversity,
				personsInsideCount,
				message: 'Successfully refreshed statistics'
			};
		} catch (err: unknown) {
			console.debug(`Failed to get statistics: ${(err as Error).message}`);
			return fail(500, {
				message: 'Failed to get statistics'
			});
		}
	}
};
