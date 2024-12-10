import { sql, ilike, type Column, type SQL } from 'drizzle-orm';

const EDIT_DISTANCE = 3;

export function fuzzySearchFilters(dbField: Column, searchQuery: string): SQL[] {
	// Assert dbField is valid
	if (dbField === null || dbField === undefined) throw new Error('Invalid dbField');
	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '')
		throw new Error('Invalid searchQuery');

	return [
		sql`LEVENSHTEIN(${dbField}, ${searchQuery}) < ${EDIT_DISTANCE}`,
		ilike(dbField, `${searchQuery}%`)
	];
}
