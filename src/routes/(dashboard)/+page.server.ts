import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { getPersons, togglePersonState } from '$lib/server/db/person';
import { invalidateSession } from '$lib/server/db/session';
import { deleteSessionTokenCookie } from '$lib/server/session';

import {
	searchFormSchema,
	toggleStateFormSchema,
	logoutFormSchema,
	guarantorSearchFormSchema
} from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { database, session } = locals;
	if (!session) return error(401, `Invalid session`);
	const { building: userBuilding } = session;

	const searchForm = await superValidate(zod(searchFormSchema));
	const toggleStateForm = await superValidate(zod(toggleStateFormSchema));
	const guarantorSearchForm = await superValidate(zod(guarantorSearchFormSchema));

	try {
		const personsP = getPersons(database, 1000, 0); // TODO: Pagination with limit and offset
		const guarantorsP = getPersons(database, 10, 0, { guarantorSearch: true });

		const persons = await personsP;
		const guarantors = await guarantorsP;

		return {
			userBuilding,
			searchForm,
			toggleStateForm,
			guarantorSearchForm,
			persons,
			guarantors
		};
	} catch (err: unknown) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	search: async ({ locals, request }) => {
		const { database } = locals;

		const searchForm = await superValidate(request, zod(searchFormSchema));
		if (!searchForm.valid) {
			return fail(400, {
				searchForm,
				message: 'Invalid form inputs'
			});
		}

		const { searchQuery } = searchForm.data;

		try {
			const persons = await getPersons(database, 1000, 0, { searchQuery });

			return {
				searchForm,
				persons
			};
		} catch (err: unknown) {
			return fail(500, {
				searchForm,
				message: `Failed to search: ${(err as Error).message}`
			});
		}
	},
	togglestate: async ({ locals, request }) => {
		const { database } = locals;

		const toggleStateForm = await superValidate(request, zod(toggleStateFormSchema));
		if (!toggleStateForm.valid) {
			return fail(400, {
				toggleStateForm,
				message: 'Invalid form inputs'
			});
		}

		if (locals.session === null || locals.user === null) {
			return fail(401, {
				toggleStateForm,
				message: 'Invalid session'
			});
		}

		const { personId } = toggleStateForm.data;
		const { building } = locals.session;
		const { username } = locals.user;

		try {
			await togglePersonState(database, personId, building, username);

			return {
				toggleStateForm,
				message: 'Successfully toggled state!'
			};
		} catch (err: unknown) {
			return fail(500, {
				toggleStateForm,
				message: `Failed to toggle state: ${(err as Error).message}`
			});
		}
	},
	guarantorSearch: async ({ locals, request }) => {
		const { database } = locals;

		const guarantorSearchForm = await superValidate(request, zod(guarantorSearchFormSchema));
		if (!guarantorSearchForm.valid) {
			return fail(400, {
				guarantorSearchForm,
				message: 'Invalid form inputs'
			});
		}

		const { guarantorSearchQuery: searchQuery } = guarantorSearchForm.data;

		try {
			const guarantors = await getPersons(database, 10, 0, {
				searchQuery,
				guarantorSearch: true
			});

			return {
				guarantorSearchForm,
				guarantors
			};
		} catch (err: unknown) {
			return fail(500, {
				guarantorSearchForm,
				message: `Failed to search for guarantors: ${(err as Error).message}`
			});
		}
	},
	logout: async (event) => {
		const { locals, request } = event;
		const { database } = locals;

		const logoutForm = await superValidate(request, zod(logoutFormSchema));
		if (!logoutForm.valid) {
			return fail(400, {
				logoutForm,
				message: 'Invalid form inputs'
			});
		}

		const { sessionId } = logoutForm.data;

		try {
			await invalidateSession(database, sessionId);
			deleteSessionTokenCookie(event);
		} catch (err: unknown) {
			return error(500, `Failed to logout: ${(err as Error).message}`);
		}

		// Has to be outside of try-catch because it throws a redirect
		return redirect(302, '/login');
	}
};
