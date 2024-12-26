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

	// Assert substr option is valid
	if (opts.substr === null) {
		throw new Error('Invalid substr option');
	}

	// Assert distance option is valid
	if (opts.distance === null || (opts.distance !== undefined && opts.distance <= 0)) {
		throw new Error('Invalid distance option');
	}

	const concatFields = sqlConcat(dbFields, ' ');
	const ilikeFilter = ilike(
		concatFields as unknown as Column, // WARN: Because there is no typedef for sql as first param in ilike function
		`${opts.substr !== undefined ? '%' : ''}${searchQuery}%`
	) as SQL<boolean>;
	const levenshteinFilter =
		opts.distance !== undefined ? [sqlLevenshtein(concatFields, searchQuery, opts.distance)] : [];

	return [ilikeFilter, ...levenshteinFilter];
}

/*
 * Returns the sql for concatenating multiple columns with a separator using CONCAT_WS
 */
export function sqlConcat(cols: Column[], separator?: string): SQL<Column> {
	return cols
		.map((col) => sql<Column>`${col}`)
		.reduce((prev, curr) =>
			separator !== undefined ? sql`${prev} || ${separator} || ${curr}` : sql`${prev} || ${curr}`
		);
}

/*
 * Returns the sql for getting the levenshtein distance if distance isn't passed
 * Otherwise, returns the sql for determining if the levenshtein distance is less than or equal to the passed distance
 */
export function sqlLevenshtein(
	col: SQL<Column>,
	input: string,
	distance?: number
): SQL<boolean | number> {
	return distance !== undefined
		? sql<boolean>`LEVENSHTEIN(LOWER(${col}), LOWER(${input})) <= ${distance}`
		: sql<number>`LEVENSHTEIN(LOWER(${col}), LOWER(${input}))`;
}
