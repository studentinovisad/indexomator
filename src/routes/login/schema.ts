import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formSchema = z.object({
	username: z.string().regex(indexRegExp, indexRegExpMsg),
	password: z.string().min(8).max(255),
	building: z.string()
});

export type FormSchema = typeof formSchema;
