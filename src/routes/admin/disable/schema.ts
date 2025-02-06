import { indexRegExp, indexRegExpMsg } from '$lib/utils/regexp';
import { z } from 'zod';

export const oneSchema = z.object({
	username: z.string().regex(indexRegExp, indexRegExpMsg),
	secret: z.string().min(32).max(255)
});

export const allSchema = z.object({
	secret: z.string().min(32).max(255)
});

export type OneSchema = typeof oneSchema;
export type allSchema = typeof allSchema;
