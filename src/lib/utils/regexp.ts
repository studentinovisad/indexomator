import { env } from '$env/dynamic/public';

export const nameRegExp = /^[a-zA-ZčČćĆǆǄđĐšŠžŽ]+(?:(?:\s|-)[a-zA-ZčČćĆǆǄđĐšŠžŽ]+)?$/;
export const nameRegExpMsg = 'String must be 1 or 2 word seperated by space or dash (-)';

export const indexRegExp = new RegExp(
	env.PUBLIC_INDEX_REGEX ?? /^\d{1,4}[a-zA-Z]?\/(?:\d{2}|\d{4})$/
);
export const indexRegExpMsg = 'String must follow Student ID format';

export const uppercaseRegExp = /^[A-Z0-9_\-+/\\|]*$/;
export const uppercaseRegExpMsg =
	'String can consist of uppercase letters, numbers, and symbols (_, -, +, /, \\, |)';

export const lowercaseRegExp = /^[a-z0-9_\-+/\\|]*$/;
export const lowercaseRegExpMsg =
	'String can consist of lowercase letters, numbers, and symbols (_, -, +, /, \\, |)';
