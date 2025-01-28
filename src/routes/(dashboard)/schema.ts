import type { SuperValidated } from 'sveltekit-superforms/client';
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
export type ToggleStateFormValidated = SuperValidated<
	{
		personId: number;
		guarantorId?: number | undefined;
	},
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	any,
	{
		personId: number;
		guarantorId?: number | undefined;
	}
>;

export const guarantorSearchFormSchema = z.object({
	guarantorSearchQuery: z.string().optional()
});
export type GuarantorSearchFormSchema = typeof guarantorSearchFormSchema;
export type GuarantorSearchFormValidated = SuperValidated<
	{
		guarantorSearchQuery?: string | undefined;
	},
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	any,
	{
		guarantorSearchQuery?: string | undefined;
	}
>;

export const logoutFormSchema = z.object({
	sessionId: z.string()
});
export type LogoutFormSchema = typeof logoutFormSchema;
