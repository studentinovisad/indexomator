import { z } from 'zod';

export const formSchema = z.object({
	building: z.string(),
	personType: z.string(),
	secret: z.string().min(32).max(255)
});

export type FormSchema = typeof formSchema;
