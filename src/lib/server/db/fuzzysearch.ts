import { sql, ilike, type Column, type SQL } from 'drizzle-orm';

type FuzzySearchFiltersOptions = {
	distance?: number;
	substr?: boolean;
};

export function fuzzySearchFilters(
	dbFields: Column[],
	searchQuery: string,
	opts: FuzzySearchFiltersOptions = {}
): SQL[] {
	// Assert dbFields are valid
	if (dbFields === null || dbFields === undefined || dbFields.length === 0) {
		throw new Error('Invalid dbFields');
	}

	// Assert searchQuery is valid
	if (searchQuery === null || searchQuery === undefined || searchQuery === '') {
		throw new Error('Invalid searchQuery');
	}

	if (opts.substr === null) throw new Error('Invalid substr');
	if (opts.distance === null || (opts.distance != undefined && opts.distance <= 0))
		throw new Error('Invalid distance');

	const concatQuery = dbFields
		.map((field) => sql`${field}`)
		.reduce((prev, curr) => sql`${prev} || ' ' || ${curr}`);

	// @ts-expect-error because there is no typedef for sql as first param in ilike function
	const ilikeFilter = [ilike(concatQuery, `${opts.substr ? '%' : ''}${searchQuery}%`)];
	const levenshteinFilter = opts.distance !== undefined
		? [sql`LEVENSHTEIN(LOWER(${concatQuery}), ${searchQuery}) <= ${opts.distance}`]
		: [];

	return [...ilikeFilter, ...levenshteinFilter];
}
