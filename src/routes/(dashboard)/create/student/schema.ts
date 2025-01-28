import { z } from 'zod';
import { indexRegExp, indexRegExpMsg, nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';

export const createFormSchema = z.object({
	fname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	identifier: z.string().regex(indexRegExp, indexRegExpMsg),
	department: z.string().optional()
});

export type CreateFormSchema = typeof createFormSchema;
