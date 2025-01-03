import type { Building } from '$lib/types/db';
import { DB as db } from './connect';
import { building } from './schema/building';

export async function getBuildings(): Promise<Building[]> {
	return await db.select().from(building).orderBy(building.name);
}

export async function createBuilding(name: string): Promise<void> {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await db.insert(building).values({
		name
	});
}
