import { sql, ilike, type Column, type SQL } from 'drizzle-orm';

const EDIT_DISTANCE = 2;

export function fuzzySearchFilters(
	dbField: Column,
	searchQuery: string,
	substr: boolean = false
): SQL[] {
	// Assert dbField is valid
	if (dbField === null || dbField === undefined) throw new Error('Invalid dbField');
	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '')
		throw new Error('Invalid searchQuery');

	return [
		sql`LEVENSHTEIN(${dbField}, ${searchQuery}) < ${EDIT_DISTANCE}`,
		ilike(dbField, `${substr ? '%' : ''}${searchQuery}%`)
	];
}

export function fuzzyConcatSearchFilters(
	dbField1: Column,
	dbField2: Column,
	searchQuery: string,
): SQL[] {
	// Assert dbFields are valid
	if (dbField1 === null || dbField1 === undefined) throw new Error('Invalid dbField');
	if (dbField2 === null || dbField2 === undefined) throw new Error('Invalid dbField');
	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '')
		throw new Error('Invalid searchQuery');

	return [
		sql`LEVENSHTEIN(${dbField1} || ' ' || ${dbField2}, ${searchQuery}) < ${EDIT_DISTANCE}`,
		// @ts-expect-error because there is no typedef for sql as first param in ilike function
		ilike(sql`${dbField1} || ' ' || ${dbField2}`, `${searchQuery}%`)
	];
}