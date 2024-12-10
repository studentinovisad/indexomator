// Sleeps for a given amount of time
export async function sleep(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}
