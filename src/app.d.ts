import type { Database } from '$lib/server/db/connect';
import type { Session, AdminSession, User } from '$lib/types/db';

declare global {
	namespace App {
		interface Locals {
			database: Database;
			adminSession: AdminSession | null;
			session: Session | null;
			user: User | null;
		}
	}
}

export {};
