import { z } from 'zod';
import { optionalGuarantor } from '$lib/utils/env';

export const searchFormSchema = z.object({
	searchQuery: z.string().optional()
});
export type SearchFormSchema = typeof searchFormSchema;

export const toggleStateFormSchema = z.object({
	personId: z.number()
});
export type ToggleStateFormSchema = typeof toggleStateFormSchema;

export const toggleGuestStateFormSchema = z.object({
	personId: z.number(),
	guarantorId: optionalGuarantor ? z.number().optional() : z.number()
});
export type ToggleGuestStateFormSchema = typeof toggleGuestStateFormSchema;

export const guarantorSearchFormSchema = z.object({
	guarantorSearchQuery: z.string().optional()
});
export type GuarantorSearchFormSchema = typeof guarantorSearchFormSchema;

export const logoutFormSchema = z.object({
	sessionId: z.string()
});
export type LogoutFormSchema = typeof logoutFormSchema;
