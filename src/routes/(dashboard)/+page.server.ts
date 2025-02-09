import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	getGuarantors,
	getInsideGuestCount,
	getPersons,
	togglePersonState
} from '$lib/server/db/person';
import { invalidateSession } from '$lib/server/db/session';
import { deleteSessionTokenCookie } from '$lib/server/session';

import {
	searchFormSchema,
	toggleStateFormSchema,
	logoutFormSchema,
	guarantorSearchFormSchema,
	toggleGuestStateFormSchema
} from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { database, session } }) => {
	if (!session) {
		return error(401, `Invalid session`);
	}
	const { building: userBuilding } = session;

	const searchForm = await superValidate(zod(searchFormSchema));
	const toggleStateForm = await superValidate(zod(toggleStateFormSchema));
	const toggleGuestStateForm = await superValidate(zod(toggleGuestStateFormSchema));
	const guarantorSearchForm = await superValidate(zod(guarantorSearchFormSchema));

	try {
		const personsP = getPersons(database, 1000, 0); // TODO: Pagination with limit and offset
		const guarantorsP = getGuarantors(database, 10);

		const persons = await personsP;
		const guarantors = await guarantorsP;

		return {
			userBuilding,
			searchForm,
			toggleStateForm,
			toggleGuestStateForm,
			guarantorSearchForm,
			persons,
			guarantors
		};
	} catch (err) {
		return error(500, `Failed to load data: ${(err as Error).message}`);
	}
};

export const actions: Actions = {
	search: async ({ locals: { database }, request }) => {
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
		} catch (err) {
			return fail(500, {
				searchForm,
				message: `Failed to search: ${(err as Error).message}`
			});
		}
	},
	guarantorSearch: async ({ locals: { database }, request }) => {
		const guarantorSearchForm = await superValidate(request, zod(guarantorSearchFormSchema));
		if (!guarantorSearchForm.valid) {
			return fail(400, {
				guarantorSearchForm,
				message: 'Invalid form inputs'
			});
		}

		const { guarantorSearchQuery: searchQuery } = guarantorSearchForm.data;

		try {
			const guarantors = await getGuarantors(database, 10, {
				searchQuery
			});

			return {
				guarantorSearchForm,
				guarantors
			};
		} catch (err) {
			return fail(500, {
				guarantorSearchForm,
				message: `Failed to search for guarantors: ${(err as Error).message}`
			});
		}
	},
	toggleState: async ({ locals: { database, session, user }, request }) => {
		const toggleStateForm = await superValidate(request, zod(toggleStateFormSchema));
		if (!toggleStateForm.valid) {
			return fail(400, {
				toggleStateForm,
				message: 'Invalid form inputs'
			});
		}

		if (session === null || user === null) {
			return fail(401, {
				toggleStateForm,
				message: 'Invalid session'
			});
		}

		const { personId } = toggleStateForm.data;
		const { building } = session;
		const { username } = user;

		try {
			await togglePersonState(database, personId, building, username);

			const insideGuestCount = await getInsideGuestCount(database, personId);
			if (insideGuestCount > 0) {
				return {
					toggleStateForm,
					warning: true,
					message: 'Person has leftover guests that are inside!'
				};
			}

			return {
				toggleStateForm,
				message: 'Successfully toggled state!'
			};
		} catch (err) {
			return fail(500, {
				toggleStateForm,
				message: `Failed to toggle state: ${(err as Error).message}`
			});
		}
	},
	toggleGuestState: async ({ locals: { database, session, user }, request }) => {
		const toggleGuestStateForm = await superValidate(request, zod(toggleGuestStateFormSchema));
		if (!toggleGuestStateForm.valid) {
			return fail(400, {
				toggleGuestStateForm,
				message: 'Invalid form inputs'
			});
		}

		if (session === null || user === null) {
			return fail(401, {
				toggleGuestStateForm,
				message: 'Invalid session'
			});
		}

		const { personId, guarantorId } = toggleGuestStateForm.data;
		const { building } = session;
		const { username } = user;

		try {
			await togglePersonState(database, personId, building, username, guarantorId);

			return {
				toggleGuestStateForm,
				message: 'Successfully toggled state!'
			};
		} catch (err) {
			return fail(500, {
				toggleGuestStateForm,
				message: `Failed to toggle state: ${(err as Error).message}`
			});
		}
	},
	logout: async (event) => {
		const {
			locals: { database },
			request
		} = event;

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
		} catch (err) {
			return error(500, `Failed to logout: ${(err as Error).message}`);
		}

		// Has to be outside of try-catch because it throws a redirect
		return redirect(302, '/login');
	}
};
