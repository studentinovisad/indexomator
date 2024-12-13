import { z } from 'zod';

export const formSchema = z.object({
	fname: z.string().min(2).max(50),
	lname: z.string().min(2).max(50),
	email: z.string().email(),
	department: z.string().min(2).max(50)
});

export type FormSchema = typeof formSchema;
