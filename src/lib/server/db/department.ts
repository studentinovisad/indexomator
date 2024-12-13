import { DB } from './connect';
import { department } from './schema/department';

export async function getBuildings(): Promise<
	{
		id: number;
		name: string;
	}[]
> {
	return await DB.select().from(department);
}

export async function createDepartment(name: string) {
	// Assert that name is valid
	if (name === null || name === undefined || name === '') {
		throw new Error('Invalid name');
	}

	await DB.insert(department).values({
		name
	});
}
