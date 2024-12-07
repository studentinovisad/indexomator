import { Column, sql, ilike } from "drizzle-orm";

const EDIT_DISTANCE = 2;

export function fuzzySearchFilters(dbField: Column, searchQuery: string) {
	return [
		sql`LEVENSHTEIN(${dbField}, ${searchQuery}) < ${EDIT_DISTANCE}`,
		ilike(dbField, `${searchQuery}%`)
	];
}