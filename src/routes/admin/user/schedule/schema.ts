import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { todstrRegExp, todstrRegExpMsg } from '$lib/sched';
import { z } from 'zod';

export const formSchema = z.object({
	username: z.string().regex(indexRegExp, indexRegExpMsg),
	schedStart: z.string().regex(todstrRegExp, todstrRegExpMsg),
	schedEnd: z.string().regex(todstrRegExp, todstrRegExpMsg),
	secret: z.string().min(32).max(255)
});

export type FormSchema = typeof formSchema;
