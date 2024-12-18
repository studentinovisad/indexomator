export function sanitizeString(value: string): string {
	return value.trim().toLowerCase().replaceAll('-', ' ').toWellFormed();
}

export function capitalizeString(value: string): string {
	return value
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function removeDiacritics(input: string): string {
	const diacriticsMap = new Map([
		['č', 'c'],
		['Č', 'C'],
		['ć', 'c'],
		['Ć', 'C'],
		['ǆ', 'dz'],
		['Ǆ', 'Dz'],
		['đ', 'dj'],
		['Đ', 'Dj'],
		['š', 's'],
		['Š', 'S'],
		['ž', 'z'],
		['Ž', 'Z']
	]);

	return input
		.split('')
		.map((char) => diacriticsMap.get(char) ?? char)
		.join('');
}
