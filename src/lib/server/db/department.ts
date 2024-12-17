import type { Department } from '$lib/types/db';
import { DB as db } from './connect';
import { department } from './schema/department';

export async function getDepartments(): Promise<Department[]> {
	return await db.select().from(department);
}

export async function createDepartment(name: string): Promise<void> {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await db.insert(department).values({
		name
	});
}
