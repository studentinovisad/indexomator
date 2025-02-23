import { z } from 'zod';

export const adminLogoutFormSchema = z.object({
	adminSessionId: z.string()
});
export type AdminLogoutFormSchema = typeof adminLogoutFormSchema;
