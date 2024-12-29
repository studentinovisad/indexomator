import { z } from 'zod';
import { nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';

export const formSchema = z.object({
	fname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
	identifier: z
		.string()
		.refine((value) => z.string().email().safeParse(value).success || /^\d{4}$/.test(value), {
			message: 'Identifier must be a valid email or a 4-digit number'
		}),
	department: z.string()
});

export type FormSchema = typeof formSchema;
