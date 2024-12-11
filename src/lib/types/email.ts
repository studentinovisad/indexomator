export type Email = string;

export function isEmail(value: string): value is Email {
	// Check using ReGeX that the email is in the correct format
	// E.g. "anystringusingonlylettersandnumbersand._+-@fqdn"
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return emailRegex.test(value);
}
