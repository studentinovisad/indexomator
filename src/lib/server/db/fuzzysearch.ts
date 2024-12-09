import { Column, sql, ilike, SQL } from 'drizzle-orm';

const EDIT_DISTANCE = 3;

export function fuzzySearchFilters(dbField: Column, searchQuery: string): SQL[] {
	return [
		sql`LEVENSHTEIN(${dbField}, ${searchQuery}) < ${EDIT_DISTANCE}`,
		ilike(dbField, `${searchQuery}%`)
	];
}
