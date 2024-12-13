import { z } from 'zod';

const indexRegExp = /^\d{1,4}[a-zA-Z]?\/\d{2,4}$/;

export const formSchema = z.object({
	fname: z.string().min(2).max(50),
	lname: z.string().min(2).max(50),
	index: z.string().regex(indexRegExp),
	department: z.string().min(2).max(50)
});

export type FormSchema = typeof formSchema;
