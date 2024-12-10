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

		// Check if the fname, lname and index are valid
		if (
			fname === null ||
			lname === null ||
			fname === undefined ||
			lname === undefined ||
			typeof fname !== 'string' ||
			typeof lname !== 'string' ||
			fname === '' ||
			lname === ''
		) {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}

		await createEmployee(fname, lname);
	} catch (err) {
		return fail(400, {
			message: `Failed to create employee: ${err}`
		});
	}
}
