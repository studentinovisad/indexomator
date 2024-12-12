import { createStudent } from '$lib/server/db/student';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	try {
		const formData = await event.request.formData();
		const fname = formData.get('fname');
		const lname = formData.get('lname');
		const index = formData.get('index');

		// Check if the fname, lname and index are valid
		if (
			fname === null ||
			fname === undefined ||
			typeof fname !== 'string' ||
			fname === '' ||
			lname === null ||
			lname === undefined ||
			typeof lname !== 'string' ||
			lname === '' ||
			index === null ||
			index === undefined ||
			typeof index !== 'string' ||
			index === ''
		) {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}

		await createStudent(index, fname, lname);
	} catch (err: unknown) {
		const msg = `Failed to create student: ${JSON.stringify(err)}`;
		console.log(msg);
		return fail(400, {
			message: msg
		});
	}
}
