import type { Database } from './connect';
import type { Department } from '$lib/types/db';
import { department } from './schema/department';

export async function getDepartments(db: Database): Promise<Department[]> {
	return await db.select().from(department).orderBy(department.name);
}

export async function createDepartment(db: Database, name: string): Promise<void> {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await db.insert(department).values({
		name
	});
}
