import { createUser } from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	try {
		const formData = await event.request.formData();
		const secret = formData.get('secret');
		const username = formData.get('username');
		const password = formData.get('password');

		// Check if the secret, username and password are valid
		if (
			secret === null ||
			username === null ||
			password === null ||
			secret === undefined ||
			username === undefined ||
			password === undefined ||
			typeof secret !== 'string' ||
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			secret === '' ||
			username === '' ||
			password === ''
		) {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}

		// Check if the secret is correct
		if (!validateSecret(secret)) {
			return fail(401, {
				message: 'Invalid secret'
			});
		}

		// Create the new user
		await createUser(username, password);
	} catch (err: any) {
		const msg = `Failed to register user: ${err.message}`;
		console.log(msg);
		return fail(400, {
			message: msg
		});
	}
}
