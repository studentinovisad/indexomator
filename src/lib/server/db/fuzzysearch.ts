import { sql, ilike, type Column, type SQL } from 'drizzle-orm';

type FuzzySearchFiltersOptions = {
	distance?: number,
	substr?: boolean
};

export function fuzzySearchFilters(
	dbField: Column,
	searchQuery: string,
	opts: FuzzySearchFiltersOptions = {}
): SQL[] {
	// Assert dbField is valid
	if (dbField === null || dbField === undefined) {
		throw new Error('Invalid dbField');
	}

	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '') {
		throw new Error('Invalid searchQuery');
	}

	const ilikeFilter = [ilike(dbField, `${opts.substr ? '%' : ''}${searchQuery}%`)];
	const levenshteinFilter = opts.distance ? [sql`LEVENSHTEIN(LOWER(${dbField}), ${searchQuery}) <= ${opts.distance}`,] : [];
	return [
		...ilikeFilter,
		...levenshteinFilter
	];
}

export function fuzzyConcatSearchFilters(
	dbField1: Column,
	dbField2: Column,
	searchQuery: string,
	opts: FuzzySearchFiltersOptions = {}
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

	// @ts-expect-error because there is no typedef for sql as first param in ilike function
	const ilikeFilter = [ilike(sql`${dbField1} || ' ' || ${dbField2}`, `${opts.substr ? '%' : ''}${searchQuery}%`)];
	const levenshteinFilter = opts.distance ? [sql`LEVENSHTEIN(LOWER(${dbField1}) || ' ' || LOWER(${dbField2}), ${searchQuery}) <= ${opts.distance}`] : [];
	return [
		...ilikeFilter,
		...levenshteinFilter
	];
}
