export const nameRegExp = /^[a-zA-ZčČćĆǆǄđĐšŠžŽ]+(?:(?:\s|-)[a-zA-ZčČćĆǆǄđĐšŠžŽ]+)?$/;
export const nameRegExpMsg =
	'String must be one word or two words with space or dash (-) in between';

export const indexRegExp = /^\d{1,4}[a-zA-Z]?\/(?:\d{2}|\d{4})$/;
export const indexRegExpMsg =
	'String must be in format: 1-4 numbers, optional single character and 2 or 4 numbers (year)';

export const uppercaseRegExp = /^[A-Z0-9_\-+\/\\|]*$/;
export const uppercaseRegExpMsg =
	'String must only consist of uppercase letters, numbers and special signs (_, -, +, /, \\, |)';

export const lowercaseRegExp = /^[a-z0-9_\-+\/\\|]*$/;
export const lowercaseRegExpMsg =
	'String must only consist of lowercase letters, numbers and special signs (_, -, +, /, \\, |)';
