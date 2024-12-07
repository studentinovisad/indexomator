// Sleeps for a given amount of time
export function sleep(ms: number) {
	new Promise((resolve) => setTimeout(resolve, ms));
}
