import { updateUserDisabled, updateAllUserDisabled } from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formOneSchema, formAllSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const formOne = await superValidate(zod(formOneSchema));
	const formAll = await superValidate(zod(formAllSchema));

	return {
		formOne,
		formAll
	};
};

export const actions: Actions = {
	disable: async ({ locals: { database }, request }) => {
		const formOne = await superValidate(request, zod(formOneSchema));
		if (!formOne.valid) {
			return fail(400, {
				formOne,
				message: 'Invalid form inputs'
			});
		}

		const { username, secret } = formOne.data;

		// Check if the secret is correct
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				formOne,
				message: 'Invalid secret'
			});
		}

		try {
			await updateUserDisabled(database, username, true);
		} catch (err: unknown) {
			console.debug(`Failed to disable user: ${(err as Error).message}`);
			return fail(400, {
				formOne,
				message: `Failed to disable user: ${(err as Error).message}`
			});
		}

		return {
			formOne,
			message: 'Successfully disabled user!'
		};
	},
	enable: async ({ locals: { database }, request }) => {
		const formOne = await superValidate(request, zod(formOneSchema));
		if (!formOne.valid) {
			return fail(400, {
				formOne,
				message: 'Invalid form inputs'
			});
		}

		const { username, secret } = formOne.data;

		// Check if the secret is correct
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				formOne,
				message: 'Invalid secret'
			});
		}

		try {
			await updateUserDisabled(database, username, false);
		} catch (err: unknown) {
			console.debug(`Failed to enable user: ${(err as Error).message}`);
			return fail(400, {
				formOne,
				message: `Failed to enable user: ${(err as Error).message}`
			});
		}

		return {
			formOne,
			message: 'Successfully enabled user!'
		};
	},
	disableall: async ({ locals: { database }, request }) => {
		const formAll = await superValidate(request, zod(formAllSchema));
		if (!formAll.valid) {
			return fail(400, {
				formAll,
				message: 'Invalid form inputs'
			});
		}

		const { secret } = formAll.data;

		// Check if the secret is correct
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				formAll,
				message: 'Invalid secret'
			});
		}

		try {
			await updateAllUserDisabled(database, true);
		} catch (err: unknown) {
			console.debug(`Failed to disable all users: ${(err as Error).message}`);
			return fail(400, {
				formAll,
				message: `Failed to disable all users: ${(err as Error).message}`
			});
		}

		return {
			formAll,
			message: 'Successfully disabled all users!'
		};
	},
	enableall: async ({ locals: { database }, request }) => {
		const formAll = await superValidate(request, zod(formAllSchema));
		if (!formAll.valid) {
			return fail(400, {
				formAll,
				message: 'Invalid form inputs'
			});
		}

		const { secret } = formAll.data;

		// Check if the secret is correct
		const secretOk = await validateSecret(secret);
		if (!secretOk) {
			return fail(401, {
				formAll,
				message: 'Invalid secret'
			});
		}

		try {
			await updateAllUserDisabled(database, false);
		} catch (err: unknown) {
			console.debug(`Failed to enable all users: ${(err as Error).message}`);
			return fail(400, {
				formAll,
				message: `Failed to enable all users: ${(err as Error).message}`
			});
		}

		return {
			formAll,
			message: 'Successfully enabled all users!'
		};
	}
};
