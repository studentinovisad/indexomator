import { ilike, type Column, type SQL } from 'drizzle-orm';
import { sqlConcat, sqlLevenshtein } from './utils';

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
		concatFields as unknown as Column, // WARN: There is no typedef for sql as first param in ilike function
		`${opts.substr === true ? '%' : ''}${searchQuery}%`
	) as SQL<boolean>;
	const levenshteinFilter =
		opts.distance !== undefined ? [sqlLevenshtein(concatFields, searchQuery, opts.distance)] : [];

	return [ilikeFilter, ...levenshteinFilter];
}
