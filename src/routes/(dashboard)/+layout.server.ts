import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { logoutFormSchema } from './schema';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const logoutForm = await superValidate(zod(logoutFormSchema));
	const sessionId = locals.session?.id;

	return {
		logoutForm,
		sessionId
	};
};
