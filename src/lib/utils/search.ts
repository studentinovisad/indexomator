import { getPersons } from '$lib/server/db/person';
import type { Person } from '$lib/types/person';

export async function search(query?: string): Promise<Person[]> {
	return await getPersons(1000, 0, query);
}
