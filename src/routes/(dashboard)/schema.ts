import { z } from 'zod';

export const searchFormSchema = z.object({
	searchQuery: z.string().optional()
});
export type SearchFormSchema = typeof searchFormSchema;

export const toggleStateFormSchema = z.object({
	personId: z.number(),
	guarantorId: z.number().optional()
});
export type ToggleStateFormSchema = typeof toggleStateFormSchema;

export const guarantorSearchFormSchema = z.object({
	guarantorSearchQuery: z.string().optional()
});
export type GuarantorSearchFormSchema = typeof guarantorSearchFormSchema;

export const logoutFormSchema = z.object({
	sessionId: z.string()
});
export type LogoutFormSchema = typeof logoutFormSchema;
