import type { User } from '$lib/server/db/schema/user';
import type { Session } from '$lib/server/db/schema/session';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
