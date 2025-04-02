const internalDiacriticsMap = new Map([
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

export const diacriticsMap = {
	get: (key: string) => internalDiacriticsMap.get(key),
	has: (key: string) => internalDiacriticsMap.has(key),
	size: () => internalDiacriticsMap.size,
	entries: () => Array.from(internalDiacriticsMap.entries()),
	keys: () => Array.from(internalDiacriticsMap.keys()),
	values: () => Array.from(internalDiacriticsMap.values())
};
