import { z } from 'zod';

export const adminLogInFormSchema = z.object({
	secret: z.string().min(32).max(255)
});

export type AdminLogInFormSchema = typeof adminLogInFormSchema;
