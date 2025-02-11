import type { Database } from './connect'
import { and, count, eq, gt, lte } from 'drizzle-orm';
import { scheduleTable, userTable } from './schema/user';

export async function isUserScheduled(db: Database, userId: number): Promise<boolean> {
	const now = new Date();

	const [{ result }] = await db.select({
		result: count()
	})
	.from(scheduleTable)
	.where(
		and(
			eq(userTable.id, userId),
			lte(scheduleTable.start, now),
			gt(scheduleTable.end, now)
		)
	);

	return result > 0;
}
