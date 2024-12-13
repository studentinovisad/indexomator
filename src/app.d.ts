import type { Database } from '$lib/server/db/connect';
import type { User } from '$lib/server/db/schema/user';
import type { Session } from '$lib/server/db/schema/session';

declare global {
	namespace App {
		interface Locals {
			database: Database;
			user: User | null;
			session: Session | null;
			building: string | null;
		}
	}
}

export {};
