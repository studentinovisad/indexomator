import type { Building } from '$lib/types/db';
import { DB } from './connect';
import { building } from './schema/building';

export async function getBuildings(): Promise<Building[]> {
	return await DB.select().from(building);
}

export async function createBuilding(name: string): Promise<void> {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await DB.insert(building).values({
		name
	});
}
