import { diacriticsMap } from '$lib/utils/sanitize';
import { sql, type Column, type SQL } from 'drizzle-orm';

type LevenshteinOptions = {
	insertCost: number;
	deleteCost: number;
	substitutionCost: number;
};

const defaultLevenshteinOptions: LevenshteinOptions = {
	insertCost: 1,
	deleteCost: 3,
	substitutionCost: 2
};

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
export function sqlLevenshtein(
	col: SQL<Column>,
	input: string,
	distance: number,
	opts: LevenshteinOptions = defaultLevenshteinOptions
): SQL<boolean> {
	return sql<boolean>`LEVENSHTEIN(LOWER(${sqlRemoveDiacritics(input)}), LOWER(${sqlRemoveDiacritics(col)}), ${opts.insertCost}, ${opts.deleteCost}, ${opts.substitutionCost}) <= ${distance}`;
}

/*
 * Returns the sql for getting the levenshtein distance
 */
export function sqlLevenshteinDistance(
	col: SQL<Column>,
	input: string,
	opts: LevenshteinOptions = defaultLevenshteinOptions
): SQL<number> {
	return sql<number>`LEVENSHTEIN(LOWER(${sqlRemoveDiacritics(input)}), LOWER(${sqlRemoveDiacritics(col)}), ${opts.insertCost}, ${opts.deleteCost}, ${opts.substitutionCost})`;
}

/*
 * Returns the input string with diacritics removed
 */
export function sqlRemoveDiacritics(input: string | Column | SQL<Column>): SQL<Column> {
	const diacritics = Array.from(diacriticsMap);
	return diacritics.reduce(
		(acc, [diacritic, sanitized]) => sql`REGEXP_REPLACE(${acc}, ${diacritic}, ${sanitized}, 'g')`,
		sql<Column>`${input}`
	);
}
