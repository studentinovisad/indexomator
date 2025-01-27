import type { enhance } from '$app/forms';
import type { SuperForm, SuperFormEvents } from 'sveltekit-superforms';
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
export type ToggleStateForm = SuperForm<
	{
		personId: number;
		guarantorId?: number | undefined;
	},
	any
>;
export type ToggleStateEnhance = (
	el: HTMLFormElement,
	events?:
		| SuperFormEvents<
				{
					personId: number;
					guarantorId?: number | undefined;
				},
				any
		  >
		| undefined
) => ReturnType<typeof enhance>;

export const logoutFormSchema = z.object({
	sessionId: z.string()
});

export type LogoutFormSchema = typeof logoutFormSchema;
