import type { Database } from './connect';
import type { University } from '$lib/types/db';
import { university } from './schema/university';

export async function getUniversities(db: Database): Promise<University[]> {
	return await db.select().from(university).orderBy(university.name);
}

export async function createUniversity(db: Database, name: string): Promise<void> {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await db.insert(university).values({
		name
	});
}
