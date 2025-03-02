import { z } from 'zod';
import { optionalGuarantor } from '$lib/utils/env';

export const searchFormSchema = z.object({
	searchQuery: z.string().optional()
});
export type SearchFormSchema = typeof searchFormSchema;

export const guarantorSearchFormSchema = z.object({
	guarantorSearchQuery: z.string().optional()
});
export type GuarantorSearchFormSchema = typeof guarantorSearchFormSchema;

export const toggleStateFormSchema = z.object({
	personId: z.number(),
	action: z
		.string()
		.default('admit')
		.refine((value) => value === 'admit' || value === 'release', "Must be 'admit' or 'release'")
});
export type ToggleStateFormSchema = typeof toggleStateFormSchema;

export const toggleGuestStateFormSchema = z.object({
	personId: z.number(),
	guarantorId: optionalGuarantor ? z.number().optional() : z.number(),
	action: z
		.string()
		.default('admit')
		.refine((value) => value === 'admit' || value === 'release', "Must be 'admit' or 'release'")
});
export type ToggleGuestStateFormSchema = typeof toggleGuestStateFormSchema;

export const showGuestsFormSchema = z.object({
	guarantorId: z.number()
});
export type ShowGuestsFormSchema = typeof showGuestsFormSchema;

export const logoutFormSchema = z.object({
	sessionId: z.string()
});
export type LogoutFormSchema = typeof logoutFormSchema;
