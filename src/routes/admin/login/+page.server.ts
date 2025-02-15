import { fail, redirect } from '@sveltejs/kit';
import { validateSecret } from '$lib/server/secret';
import type { Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { adminLoginSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(adminLoginSchema));

	return {
		form
	};
};

export const actions: Actions = {
    login: async ({ request, locals }) => {
        const form = await superValidate(request, zod(adminLoginSchema));
        console.log(form);
        if (!form.valid) {
            return fail(400, {
                form,
                message: 'Invalid form inputs'
            });
        }

        const secretOk = await validateSecret(form.data.secret);
        if (!secretOk) {
            return fail(401, {
                form,
                message: 'Invalid secret'
            });
        }

        // Mark admin session as authenticated
        locals.adminAuthenticated = true;

        throw redirect(302, '/admin');
    }
};
