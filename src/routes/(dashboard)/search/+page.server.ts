import { getStudents, toggleStudentState } from '$lib/server/db/student';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEmployees, toggleEmployeeState } from '$lib/server/db/employee';
import { Employee, Student, type Person } from '$lib/types/person';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const searchQuery = url.searchParams.get('q') ?? undefined;

		const studentsP = getStudents(searchQuery);
		const employeesP = getEmployees(searchQuery);
		const students = await studentsP;
		const employees = await employeesP;

		const persons: Person[] = [
			...students.map((s) => ({
				id: s.id,
				type: Student,
				identifier: s.index,
				fname: s.fname,
				lname: s.lname,
				state: s.state
			})),
			...employees.map((e) => ({
				id: e.id,
				type: Employee,
				identifier: e.email,
				fname: e.fname,
				lname: e.lname,
				state: e.state
			}))
		];

		return {
			searchQuery,
			persons
		};
	} catch (err: any) {
		return fail(400, {
			message: `Failed to get students or employees: ${JSON.stringify(err)}`
		});
	}
};

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	try {
		const formData = await event.request.formData();
		const idS = formData.get('id');
		const type = formData.get('type');

		// Check if the id and type are valid
		if (
			idS === null ||
			idS === undefined ||
			typeof idS !== 'string' ||
			idS === '' ||
			type === null ||
			type === undefined ||
			typeof type !== 'string' ||
			type === ''
		) {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}

		const id = Number.parseInt(idS);
		if (type === Student) {
			await toggleStudentState(id);
		} else if (type === Employee) {
			await toggleEmployeeState(id);
		} else {
			return fail(400, {
				message: 'Invalid type'
			});
		}
	} catch (err: any) {
		const msg = `Failed to toggle state: ${JSON.stringify(err)}`;
		console.log(msg);
		return fail(400, {
			message: msg
		});
	}
}
