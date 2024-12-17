export const nameRegExp = /^[a-zA-ZčČćĆǆǄđĐšŠžŽ]+(?:(?:\s|-)[a-zA-ZčČćĆǆǄđĐšŠžŽ]+)?$/;
export const nameRegExpMsg =
	'String must be 1-2 word(s) seperated by space or dash (-)';

export const indexRegExp = /^\d{1,4}[a-zA-Z]?\/(?:\d{2}|\d{4})(?:[A-Z]{1,3})?$/;
export const indexRegExpMsg =
	'String must follow Student ID format';

export const uppercaseRegExp = /^[A-Z0-9_\-+/\\|]*$/;
export const uppercaseRegExpMsg =
	'String can consist of uppercase letters, numbers, and symbols (_, -, +, /, \, |)';

export const lowercaseRegExp = /^[a-z0-9_\-+/\\|]*$/;
export const lowercaseRegExpMsg =
	'String can consist of lowercase letters, numbers, and symbols (_, -, +, /, \, |)';
