import { z } from 'zod';
import { nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';

export const formSchema = z.object({
	fname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
	email: z.string().email(),
	department: z.string().min(2).max(50)
});

export type FormSchema = typeof formSchema;
