import type { Database } from './connect'
import { and, count, eq, gt, lte } from 'drizzle-orm';
import { shiftTable, userTable } from './schema/user';

export async function isUserScheduled(db: Database, userId: number): Promise<boolean> {
	const now = new Date();

	const [{ shiftCount }] = await db.select({
		shiftCount: count()
	})
	.from(shiftTable)
	.where(
		and(
			eq(userTable.id, userId),
			lte(shiftTable.start, now),
			gt(shiftTable.end, now)
		)
	);

	return shiftCount > 0;
}
