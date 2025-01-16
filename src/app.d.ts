import type { Database } from '$lib/server/db/connect';
import type { User } from '$lib/server/db/schema/user';
import type { Session } from '$lib/types/db';

declare global {
	namespace App {
		interface Locals {
			database: Database;
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
