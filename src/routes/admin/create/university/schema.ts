import { wordRegExp, wordRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formSchema = z.object({
	university: z.string().regex(wordRegExp, wordRegExpMsg),
	secret: z.string().min(32).max(255)
});

export type FormSchema = typeof formSchema;
