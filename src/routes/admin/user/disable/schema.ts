import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const formOneSchema = z.object({
	username: z.string().regex(indexRegExp, indexRegExpMsg),
	secret: z.string().min(32).max(255),
	action: z
		.string()
		.default('disable') // Has to have default in order to pass client validation
		.refine((value) => value === 'disable' || value === 'enable', "Must be 'disable' or 'enable'")
});
export type FormOneSchema = typeof formOneSchema;

export const formAllSchema = z.object({
	secret: z.string().min(32).max(255),
	action: z
		.string()
		.default('disable') // Has to have default in order to pass client validation
		.refine((value) => value === 'disable' || value === 'enable', "Must be 'disable' or 'enable'")
});
export type FormAllSchema = typeof formAllSchema;
