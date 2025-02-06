import { indexRegex } from './env';

export const nameRegExp = /^[a-zA-ZčČćĆǆǄđĐšŠžŽ]+(?:(?:\s|-)[a-zA-ZčČćĆǆǄđĐšŠžŽ]+)?\s*$/;
export const nameRegExpMsg = 'String must be 1-2 word(s) seperated by space or dash (-)';

export const indexRegExp = new RegExp(indexRegex);
export const indexRegExpMsg = 'String must follow Student ID format';

export const wordRegExp = /^[\w\-+/\\|][\w\-+/\\|\s]*$/;
export const wordRegExpMsg =
	'String can consist of letters, numbers, symbols (_, -, +, /, \\, |) and whitespaces';
