import { sql, ilike, type Column, type SQL } from 'drizzle-orm';

export function fuzzySearchFilters(
	dbField: Column,
	searchQuery: string,
	distance: number,
	substr: boolean = false
): SQL[] {
	// Assert dbField is valid
	if (dbField === null || dbField === undefined) {
		throw new Error('Invalid dbField');
	}

	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '') {
		throw new Error('Invalid searchQuery');
	}

	// Assert distance is valid
	if (distance === null || distance === undefined) {
		throw new Error('Invalid distance');
	}

	// Assert substr is valid
	if (substr === null || substr === undefined) {
		throw new Error('Invalid substr');
	}

	return [
		sql`LEVENSHTEIN(LOWER(${dbField}), ${searchQuery}) <= ${distance}`,
		ilike(dbField, `${substr ? '%' : ''}${searchQuery}%`)
	];
}

export function fuzzyConcatSearchFilters(
	dbField1: Column,
	dbField2: Column,
	searchQuery: string,
	distance: number,
	substr: boolean = false
): SQL[] {
	// Assert dbField1 is valid
	if (dbField1 === null || dbField1 === undefined) {
		throw new Error('Invalid dbField1');
	}

	// Assert dbField2 is valid
	if (dbField2 === null || dbField2 === undefined) {
		throw new Error('Invalid dbField2');
	}

	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '') {
		throw new Error('Invalid searchQuery');
	}

	// Assert distance is valid
	if (distance === null || distance === undefined) {
		throw new Error('Invalid distance');
	}

	// Assert substr is valid
	if (substr === null || substr === undefined) {
		throw new Error('Invalid substr');
	}
	
	return [
		sql`LEVENSHTEIN(LOWER(${dbField1}) || ' ' || LOWER(${dbField2}), ${searchQuery}) <= ${distance}`,
		// @ts-expect-error because there is no typedef for sql as first param in ilike function
		ilike(sql`${dbField1} || ' ' || ${dbField2}`, `${substr ? '%' : ''}${searchQuery}%`)
	];
}
