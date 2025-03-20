import { z } from 'zod';
import { nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';
import { optionalDepartment } from '$lib/utils/env';

export const createFormSchema = z.object({
	fname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	identifier: z
		.string()
		.refine((value) => z.string().email().safeParse(value).success || /^\d{4}$/.test(value), {
			message: 'Identifier must be a valid email or a 4-digit number'
		}),
	department: optionalDepartment ? z.string().optional() : z.string(),
	entry: z.boolean().default(true)
});
export type CreateFormSchema = typeof createFormSchema;
