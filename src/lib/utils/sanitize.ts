export function sanitizeString(value: string): string {
	return value.trim().toLowerCase().replaceAll('-', ' ').toWellFormed();
}

export function capitalizeString(value: string): string {
	return value
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
