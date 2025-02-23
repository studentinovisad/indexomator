import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { adminLogoutFormSchema } from './schema';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const adminLogoutForm = await superValidate(zod(adminLogoutFormSchema));
	const adminSessionId = locals.adminSession?.id;

	return {
		adminLogoutForm,
		adminSessionId
	};
};
