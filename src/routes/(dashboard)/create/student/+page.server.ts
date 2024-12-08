import { createStudent } from '$lib/server/db/student';
import { fail, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const { database } = event.locals;

	const formData = await event.request.formData();
	const fname = formData.get('fname');
	const lname = formData.get('lname');
	const index = formData.get('index');

	// Check if the fname, lname and index are not null are strings and not empty
	if (
		fname === null ||
		lname === null ||
		index === null ||
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

	await createStudent(database, fname, lname, index);
}
