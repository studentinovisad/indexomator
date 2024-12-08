export function isInside(entryTimestamp: Date, exitTimestamp: Date | null): boolean {
	return exitTimestamp !== null ? entryTimestamp > exitTimestamp : true;
}
