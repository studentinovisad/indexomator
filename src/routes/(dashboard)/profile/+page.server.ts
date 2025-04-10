import { fail, error, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { assertValidString } from '$lib/server/db/utils';
import { verifyPasswordStrength, verifyPasswordHash } from '$lib/server/password';
import { updateUserPassword } from '$lib/server/db/user';
import { invalidateAllSessions } from '$lib/server/db/session';
import { deleteSessionTokenCookie } from '$lib/server/session';

import { updatePasswordFormSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const updatePasswordForm = await superValidate(zod(updatePasswordFormSchema));

	return {
		updatePasswordForm
	};
};

export const actions: Actions = {
	default: async (event) => {
		const {
			locals: { database, session, user },
			request
		} = event;

		const updatePasswordForm = await superValidate(request, zod(updatePasswordFormSchema));

		if (!updatePasswordForm.valid) {
			return fail(400, {
				updatePasswordForm,
				message: 'Invalid form inputs'
			});
		}

		if (session === null || user === null) {
			return fail(401, {
				updatePasswordForm,
				message: 'Invalid session'
			});
		}

		const { currentPassword, newPassword, newPasswordConfirmation } = updatePasswordForm.data;

		try {
			assertValidString(newPassword, 'Invalid password');

			const strong = await verifyPasswordStrength(newPassword);
			if (!strong) {
				throw new Error('Password is too weak');
			}

			const currentPasswordIsCorrect = await verifyPasswordHash(user.passwordHash, currentPassword);

			let failMessage: string | undefined;

			if (!currentPasswordIsCorrect) {
				failMessage = 'Current password is incorrect.';
			}

			if (newPassword !== newPasswordConfirmation) {
				failMessage = "Password confirmation doesn't match the password.";
			}

			if (failMessage) {
				return fail(400, {
					updatePasswordForm,
					message: failMessage
				});
			}

			await updateUserPassword(database, user.username, newPassword);

			try {
				await invalidateAllSessions(database, user.id);

				deleteSessionTokenCookie(event);
			} catch (err) {
				return error(500, `Failed to logout: ${(err as Error).message}`);
			}
		} catch (err) {
			return fail(400, {
				updatePasswordForm,
				message: `Failed to update password: ${(err as Error).message}`
			});
		}

		const searchParams = new URLSearchParams({
			messageType: 'success',
			messageText: 'Successfully updated password!'
		});

		// Has to be outside of try-catch because it throws a redirect
		return redirect(302, `/login?${searchParams}`);
	}
};
