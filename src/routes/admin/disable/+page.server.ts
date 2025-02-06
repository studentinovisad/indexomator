import {
	getUserIdAndPasswordHash,
	updateUserDisabled,
	updateAllUserDisabled
} from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { oneSchema, allSchema } from './schema';

export const load: PageServerLoad = async () => {
	const formOne = await superValidate(zod(oneSchema));
	const formAll = await superValidate(zod(allSchema));

	return {
		formOne,
		formAll
	};
};

// XXX: what are types of event and what does it return?
// These are here just to silence errors.
async function updateStatus(event: any, newDisabled: boolean): Promise<any> {
	const { locals, request } = event;
	const { database } = locals;
	const formOne = await superValidate(request, zod(oneSchema));
	const formAll = await superValidate(zod(allSchema));
	if (!formOne.valid) {
		return fail(400, {
			formOne,
			formAll,
			message: 'Invalid form inputs'
		});
	}

	const verb = newDisabled ? 'disabled' : 'enabled';

	// Check if the secret is correct
	const secretOk = await validateSecret(formOne.data.secret);
	if (!secretOk) {
		return fail(401, {
			formOne,
			formAll,
			message: 'Invalid secret'
		});
	}

	try {
		const { username } = formOne.data;
		const { id } = await getUserIdAndPasswordHash(database, username);
		await updateUserDisabled(database, id, newDisabled);
	} catch (err: unknown) {
		console.debug(`Failed to${verb} user ${formOne.data.username}: ${(err as Error).message}`);
		return fail(400, {
			formOne,
			formAll,
			message: 'username does not exist'
		});
	}

	return {
		formOne,
		formAll,
		message: `User ${verb}d!`
	};
}

async function updateAllStatus(event: any, newDisabled: boolean): Promise<any> {
	const { locals, request } = event;
	const { database } = locals;
	const formOne = await superValidate(zod(oneSchema));
	const formAll = await superValidate(request, zod(allSchema));
	if (!formAll.valid) {
		return fail(400, {
			formOne,
			formAll,
			message: 'Invalid form inputs'
		});
	}

	const verb = newDisabled ? 'disabled' : 'enabled';

	// Check if the secret is correct
	const secretOk = await validateSecret(formAll.data.secret);
	if (!secretOk) {
		return fail(401, {
			formOne,
			formAll,
			message: 'Invalid secret'
		});
	}

	try {
		await updateAllUserDisabled(database, newDisabled);
	} catch (err: unknown) {
		console.debug(`Failed to${verb} all users: ${(err as Error).message}`);
		return fail(400, {
			formOne,
			formAll,
			message: 'something went wrong'
		});
	}

	return {
		formOne,
		formAll,
		message: `All users ${verb}d!`
	};
}

export const actions: Actions = {
	disable: async (event) => await updateStatus(event, true),
	enable: async (event) => await updateStatus(event, false),
	disableall: async (event) => await updateAllStatus(event, true),
	enableall: async (event) => await updateAllStatus(event, false)
};
