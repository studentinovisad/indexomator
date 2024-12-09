import { createStudent } from '$lib/server/db/student';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const formData = await event.request.formData();
	const fname = formData.get('fname');
	const lname = formData.get('lname');
	const index = formData.get('index');

	// Check if the fname, lname and index are valid
	if (
		fname === null ||
		lname === null ||
		index === null ||
		fname === undefined ||
		lname === undefined ||
		index === undefined ||
		typeof fname !== 'string' ||
		typeof lname !== 'string' ||
		typeof index !== 'string' ||
		fname === '' ||
		lname === '' ||
		index === ''
	) {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}

	await createStudent(fname, lname, index);
}
