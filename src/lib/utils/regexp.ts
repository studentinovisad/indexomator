export const nameRegExp = /^\w+(?:\s\w+)?$/;
export const nameRegExpMsg = 'String must be one word or two words with space in between';

export const indexRegExp = /^\d{1,4}[a-zA-Z]?\/(?:\d{2}|\d{4})$/;
export const indexRegExpMsg =
	'String must be in format: 1-4 numbers, optional single character and 2 or 4 numbers (year)';
