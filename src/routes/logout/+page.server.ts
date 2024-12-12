import { invalidateSession } from '$lib/server/db/session';
import { deleteSessionTokenCookie } from '$lib/server/session';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	try {
		const formData = await event.request.formData();
		const idS = formData.get('id_session');

		if (idS === null || idS === undefined || typeof idS !== 'string' || idS === '') {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}
		await invalidateSession(idS);
		deleteSessionTokenCookie(event);
	} catch (err: unknown) {
		const msg = `Failed to toggle state: ${JSON.stringify(err)}`;
		console.log(msg);
		return fail(400, {
			message: msg
		});
	}

	return redirect(302, '/login');
}
