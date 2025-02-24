import { z } from 'zod';

export const banFormSchema = z.object({
	personId: z.number(),
	action: z
		.string()
		.default('ban')
		.refine((value) => value === 'ban' || value === 'pardon', "Must be 'ban' or 'pardon'")
});
export type BanFormSchema = typeof banFormSchema;

export const searchFormSchema = z.object({
	searchQuery: z.string().optional()
});
export type SearchFormSchema = typeof searchFormSchema;
