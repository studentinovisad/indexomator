import { createEmployee } from '$lib/server/db/employee';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	try {
		const formData = await event.request.formData();
		const fname = formData.get('fname');
		const lname = formData.get('lname');
		const email = formData.get('email');

		// Check if the fname, lname and index are valid
		if (
			email === null ||
			email === undefined ||
			typeof email !== 'string' ||
			email === '' ||
			fname === null ||
			fname === undefined ||
			typeof fname !== 'string' ||
			fname === '' ||
			lname === null ||
			lname === undefined ||
			typeof lname !== 'string' ||
			lname === ''
		) {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}

		await createEmployee(email, fname, lname);
	} catch (err: unknown) {
		const msg = `Failed to create employee: ${JSON.stringify(err)}`;
		console.log(msg);
		return fail(400, {
			message: msg
		});
	}
}
