import { z } from 'zod';
import { indexRegExp, indexRegExpMsg, nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';

export const formSchema = z.object({
    id: z.number(),
    fname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
    lname: z.string().min(2).max(50).regex(nameRegExp, nameRegExpMsg),
    department: z.string(),
});

export type FormSchema = typeof formSchema;
