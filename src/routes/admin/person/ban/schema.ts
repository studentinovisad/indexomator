import { z } from 'zod';

export const formSchema = z.object({
	personId : z.number(),
	secret: z.string().min(32).max(255)
});


export const personSearchFormSchema = z.object({
	personSearchQuery: z.string().optional()
});
export type FormSchema = typeof formSchema;
