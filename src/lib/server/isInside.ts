export function isInside(entryTimestamp: Date | null, exitTimestamp: Date | null): boolean {
	// Assert entryTimestamp is valid
	if (entryTimestamp === null || entryTimestamp === undefined) {
		throw new Error('Entry timestamp is not valid');
	}

	// Assert exitTimestamp is valid, null is allowed
	if (exitTimestamp === undefined) {
		throw new Error('Exit timestamp is not valid');
	}

	return exitTimestamp !== null ? entryTimestamp >= exitTimestamp : true;
}
