import type { Department } from '$lib/types/db';
import { DB } from './connect';
import { department } from './schema/department';

export async function getDepartments(): Promise<Department[]> {
	return await DB.select().from(department);
}

export async function createDepartment(name: string): Promise<void> {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await DB.insert(department).values({
		name
	});
}
