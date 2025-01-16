import { z } from 'zod';
import { nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';

export const formSchema = z.object({
	fname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	identifier: z.string().min(4),
	university: z.string().optional(),
	guarantorId: z.number().optional()
});

export type FormSchema = typeof formSchema;
