import { z } from 'zod';

export const formSchema = z.object({
	building: z.string().min(2).max(50),
	secret: z.string().min(32).max(255)
});

export type FormSchema = typeof formSchema;
