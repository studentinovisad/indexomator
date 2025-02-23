import { diacriticsMap } from './diacritics';

export function sanitizeString(input: string): string {
	return input.trim().toLowerCase().replaceAll('-', ' ').toWellFormed();
}

export function capitalizeString(input: string): string {
	return input
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function removeDiacritics(input: string): string {
	return input
		.split('') // Splits string into characters
		.map((char) => diacriticsMap.get(char) ?? char)
		.join('');
}
