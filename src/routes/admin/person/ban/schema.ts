import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formSchema = z.object({
	personId: z.string().regex(indexRegExp, indexRegExpMsg),
	secret: z.string().min(32).max(255),
	action: z
		.string()
		.default('disable')
		.refine((value) => value === 'disable' || value === 'enable', "Must be 'disable' or 'enable'")
});
export type FormSchema = typeof formSchema;
