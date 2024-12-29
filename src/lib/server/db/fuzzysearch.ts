import { sql, ilike, type Column, type SQL } from 'drizzle-orm';

type FuzzySearchFiltersOptions = {
	distance?: number;
	substr?: boolean;
};

type LevenshteinOptions = {
	insertCost?: number;
	deleteCost?: number;
	substitutionCost?: number;
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
		concatFields as unknown as Column, // WARN: There is no typedef for sql as first param in ilike function
		`${opts.substr === true ? '%' : ''}${searchQuery}%`
	) as SQL<boolean>;
	const levenshteinFilter =
		opts.distance !== undefined ? [sqlLevenshtein(concatFields, searchQuery, opts.distance)] : [];

	return [ilikeFilter, ...levenshteinFilter];
}

/*
 * Returns the sql for concatenating multiple columns with a separator using CONCAT_WS
 */
export function sqlConcat(cols: Column[], separator?: string): SQL<Column> {
	if (cols.length === 0) {
		throw new Error('Passed columns length is 0');
	}

	if (cols.length === 1) {
		return sql<Column>`${cols[0]}`;
	}

	const sqlCols = cols
		.map((col) => sql<Column>`${col}`)
		.reduce((prev, curr) => sql`${prev}, ${curr}`);
	return separator !== undefined
		? sql<Column>`CONCAT_WS(${separator}, ${sqlCols})`
		: sql<Column>`CONCAT(${sqlCols})`;
}

/*
 * Returns the sql for getting the least value out of N columns
 */
export function sqlLeast(cols: SQL<number>[]): SQL<number> {
	const sqlCols = cols.reduce((prev, curr) => sql`${prev}, ${curr}`);
	return sql<number>`LEAST(${sqlCols})`;
}

/*
 * Returns the sql for determining if the levenshtein distance is less than or equal to the passed distance
 */
export function sqlLevenshtein(col: SQL<Column>, input: string, distance: number): SQL<boolean> {
	return sql<boolean>`LEVENSHTEIN(LOWER(${col}), LOWER(${input})) <= ${distance}`;
}

/*
 * Returns the sql for getting the levenshtein distance
 */
export function sqlLevenshteinDistance(
	col: SQL<Column>,
	input: string,
	opts: LevenshteinOptions = {}
): SQL<number> {
	return sql<number>`LEVENSHTEIN(LOWER(${col}), LOWER(${input}), ${opts.insertCost ?? 1}, ${opts.deleteCost ?? 3}, ${opts.substitutionCost ?? 2})`;
}
