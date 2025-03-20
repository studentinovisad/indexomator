export function isInside(entryTimestamp: Date | null, exitTimestamp: Date | null): boolean {
	// Assert that entry timestamp is present if the exit timestamp is also present
	if (entryTimestamp === null && exitTimestamp !== null) {
		throw new Error('Entry timestamp is missing while the exit is present');
	}

	if (entryTimestamp === null) return false;
	else if (exitTimestamp === null) return true;
	else return entryTimestamp >= exitTimestamp;
}
