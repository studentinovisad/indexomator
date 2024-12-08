import { getStudents, toggleStudentState } from '$lib/server/db/student';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEmployees, toggleEmployeeState } from '$lib/server/db/employee';
import { Employee, Student, type Person } from '$lib/types/person';

export const load: PageServerLoad = async () => {
	const studentsP = getStudents();
	const employeesP = getEmployees();
	const students = await studentsP;
	const employees = await employeesP;
	const persons: Person[] = [
		...students.map((s) => ({ ...s, type: Student })),
		...employees.map((e) => ({ ...e, type: Employee, index: null }))
	];

	return {
		persons
	};
};

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const formData = await event.request.formData();
	const idS = formData.get('id');
	const type = formData.get('type');

	// Check if the id is not null is string and not empty
	if (idS === null || typeof idS !== 'string' || type === null || typeof type !== 'string') {
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
}
