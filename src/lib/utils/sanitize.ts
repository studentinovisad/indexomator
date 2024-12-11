export function sanitizeString(value: string): string {
	return value.trim().toLowerCase().toWellFormed();
}
