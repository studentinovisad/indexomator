import type { building } from '$lib/server/db/schema/building';
import type { department } from '$lib/server/db/schema/department';
import type { adminSessionTable, sessionTable } from '$lib/server/db/schema/session';
import type { university } from '$lib/server/db/schema/university';
import type { userTable } from '$lib/server/db/schema/user';
import type { InferSelectModel } from 'drizzle-orm';

export type Building = InferSelectModel<typeof building>;
export type Department = InferSelectModel<typeof department>;
export type Session = InferSelectModel<typeof sessionTable>;
export type AdminSession = InferSelectModel<typeof adminSessionTable>;
export type University = InferSelectModel<typeof university>;
export type User = InferSelectModel<typeof userTable>;
