import { z } from 'zod';
import { indexRegExp, indexRegExpMsg, nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';
import { optionalDepartment, optionalUniversity, rectorateMode } from '$lib/utils/env';

export const createFormSchema = z.object({
	fname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	identifier: z.string().regex(indexRegExp, indexRegExpMsg),
	university: rectorateMode
		? optionalUniversity
			? z.string().optional()
			: z.string()
		: z.string().optional(),
	department: !rectorateMode
		? optionalDepartment
			? z.string().optional()
			: z.string()
		: z.string().optional(),
	entry: z.boolean().default(true)
});
export type CreateFormSchema = typeof createFormSchema;
