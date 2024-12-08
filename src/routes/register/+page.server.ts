import { createUser } from '$lib/server/db/user';
import { validateSecret } from '$lib/server/secret';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const { database } = event.locals;

	const formData = await event.request.formData();
	const secret = formData.get('secret');
	const username = formData.get('username');
	const password = formData.get('password');

	// Check if the secret, username and password are not null are strings and not empty
	if (
		secret === null ||
		username === null ||
		password === null ||
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
	await createUser(database, username, password);
}
