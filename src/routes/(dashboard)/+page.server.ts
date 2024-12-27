import { toggleStudentState, getStudentsCountPerBuilding } from '$lib/server/db/student';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { toggleEmployeeState, getEmployeesCountPerBuilding } from '$lib/server/db/employee';
import { Employee, Student } from '$lib/types/person';
import { invalidateSession } from '$lib/server/db/session';
import { deleteSessionTokenCookie } from '$lib/server/session';
import { search } from '$lib/utils/search';

export const load: PageServerLoad = async () => {
	try {
		const personsP = search();
		const studentsInsideP = getStudentsCountPerBuilding();
		const employeesInsideP = getEmployeesCountPerBuilding();

    const persons = await personsP;
		const studentsInside = await studentsInsideP;
		const employeesInside = await employeesInsideP;

		return {
			persons,
			studentsInside,
			employeesInside
		};
	} catch (err: unknown) {
		console.debug(`Failed to get students and employees: ${(err as Error).message}`);
		return fail(500, {
			message: 'Failed to get students and employees'
		});
	}
};

export const actions: Actions = {
	search: async ({ request }) => {
		try {
			const formData = await request.formData();
			const searchQuery = formData.get('q');

			// Check if the searchQuery is valid
			if (searchQuery === null || searchQuery === undefined || typeof searchQuery !== 'string') {
				return fail(400, {
					message: 'Invalid search query'
				});
			}

			const persons = await search(searchQuery);
			return {
				searchQuery,
				persons
			};
		} catch (err: unknown) {
			console.debug(`Failed to search: ${(err as Error).message}`);
			return fail(500, {
				message: 'Failed to search'
			});
		}
	},
	togglestate: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const idS = formData.get('id');
			const type = formData.get('type');
			const searchQuery = formData.get('q');

			// Check if the id, type and searchQuery are valid
			if (
				idS === null ||
				idS === undefined ||
				typeof idS !== 'string' ||
				idS === '' ||
				type === null ||
				type === undefined ||
				typeof type !== 'string' ||
				type === '' ||
				searchQuery === null ||
				searchQuery === undefined ||
				typeof searchQuery !== 'string'
			) {
				return fail(400, {
					message: 'Invalid or missing fields'
				});
			}

			if (locals.session === null || locals.user === null) {
				return fail(401, {
					message: 'Invalid session'
				});
			}
			const { building } = locals.session;
			const { username } = locals.user;

			const id = Number.parseInt(idS);
			if (type === Student) {
				await toggleStudentState(id, building, username);
			} else if (type === Employee) {
				await toggleEmployeeState(id, building, username);
			} else {
				return fail(500, {
					message: 'Invalid type (neither student nor employee)'
				});
			}

			const persons = await search(searchQuery);
			return {
				searchQuery,
				persons,
				message: 'Successfully toggled state'
			};
		} catch (err: unknown) {
			console.debug(`Failed to toggle state: ${(err as Error).message}`);
			return fail(400, {
				message: 'Failed to toggle state'
			});
		}
	},
	logout: async (event) => {
		try {
			const formData = await event.request.formData();
			const idS = formData.get('id_session');
			if (idS === null || idS === undefined || typeof idS !== 'string' || idS === '') {
				return fail(400, {
					message: 'Invalid or missing fields'
				});
			}

			await invalidateSession(idS);
			deleteSessionTokenCookie(event);
		} catch (err: unknown) {
			console.debug(`Failed to logout: ${(err as Error).message}`);
			return fail(400, {
				message: 'Failed to logout'
			});
		}

		return redirect(302, '/login');
	}
};
