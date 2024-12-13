import { uppercaseRegExp, uppercaseRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formSchema = z.object({
	department: z.string().min(2).max(20).regex(uppercaseRegExp, uppercaseRegExpMsg),
	secret: z.string().min(32).max(255)
});

export type FormSchema = typeof formSchema;
