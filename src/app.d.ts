import type { User } from '$lib/server/user';
import type { Session } from '$lib/server/session';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
