import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formOneSchema = z.object({
	username: z.string().regex(indexRegExp, indexRegExpMsg),
	secret: z.string().min(32).max(255)
});
export type FormOneSchema = typeof formOneSchema;

export const formAllSchema = z.object({
	secret: z.string().min(32).max(255)
});
export type FormAllSchema = typeof formAllSchema;
