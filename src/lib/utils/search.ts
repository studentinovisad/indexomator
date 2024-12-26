import { getEmployees } from '$lib/server/db/employee';
import { getStudents } from '$lib/server/db/student';
import { Employee, Student, type Person } from '$lib/types/person';

export async function search(query?: string): Promise<Person[]> {
	const studentsP = getStudents(1000, 0, query);
	const employeesP = getEmployees(1000, 0, query);
	const students = await studentsP;
	const employees = await employeesP;

	return [
		...students.map((s) => ({
			id: s.id,
			type: Student,
			identifier: s.index,
			fname: s.fname,
			lname: s.lname,
			department: s.department,
			building: s.building,
			state: s.state
		})),
		...employees.map((e) => ({
			id: e.id,
			type: Employee,
			identifier: e.email,
			fname: e.fname,
			lname: e.lname,
			department: e.department,
			building: e.building,
			state: e.state
		}))
	];
}
