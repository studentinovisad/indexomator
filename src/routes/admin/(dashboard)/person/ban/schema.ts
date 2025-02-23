import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formSchema = z.object({
	identifier: z.string().regex(indexRegExp, indexRegExpMsg),
	action: z
		.string()
		.default('ban')
		.refine((value) => value === 'ban' || value === 'pardon', "Must be 'ban' or 'pardon'")
});
export type FormSchema = typeof formSchema;
