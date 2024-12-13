import { DB } from './connect';
import { building } from './schema/building';

export async function getBuildings(): Promise<
	{
		id: number;
		name: string;
	}[]
> {
	return await DB.select().from(building);
}

export async function createBuilding(name: string) {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await DB.insert(building).values({
		name
	});
}
