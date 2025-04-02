import type { Database } from './connect';
import type { Building } from '$lib/types/db';
import { building } from './schema/building';

export async function getBuildings(db: Database): Promise<Building[]> {
	return await db.select().from(building).orderBy(building.name);
}

export async function createBuilding(db: Database, buildingName: string): Promise<void> {
	// Assert that name is valid
	if (buildingName === '') {
		throw new Error('Invalid name');
	}

	const name = buildingName.trim();
	await db.insert(building).values({
		name
	});
}
