import type { Database } from './connect';
import type { University } from '$lib/types/db';
import { university } from './schema/university';

export async function getUniversities(db: Database): Promise<University[]> {
	return await db.select().from(university).orderBy(university.name);
}

export async function createUniversity(db: Database, universityName: string): Promise<void> {
	// Assert that name is valid
	if (universityName === '') {
		throw new Error('Invalid name');
	}

	const name = universityName.trim();
	await db.insert(university).values({
		name
	});
}
