import { z } from 'zod';
import { indexRegExp, indexRegExpMsg, nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';

export const formSchema = z.object({
	fname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
	index: z.string().regex(indexRegExp, indexRegExpMsg),
	department: z.string().min(2).max(50)
});

export type FormSchema = typeof formSchema;
