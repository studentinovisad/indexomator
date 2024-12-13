import { z } from 'zod';

export const formSchema = z.object({
	username: z.string().min(2).max(50),
	password: z.string().min(8).max(255),
	secret: z.string().min(32).max(255)
});

export type FormSchema = typeof formSchema;
