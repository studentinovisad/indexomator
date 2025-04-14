import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { verifyPasswordStrength, verifyPasswordHash, hashPassword} from '$lib/server/password';
import { assertValidString, updateUserPassword } from '$lib/server/db/user';


import { updatePasswordFormSchema } from './schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { database } }) => {
	const updatePasswordForm = await superValidate(zod(updatePasswordFormSchema));

	return {
		updatePasswordForm,
	};
};

export const actions: Actions = {
	default: async ({ locals: { database, session, user }, request }) => {
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
		const passwords = [currentPassword, newPassword, newPasswordConfirmation];

		try {
			for(const password of passwords) {
				assertValidString(password, 'Invalid password');

				const strong = await verifyPasswordStrength(password);
				if (!strong) {
					throw new Error('Password is too weak');
				}
			}

			const currentPasswordIsCorrect = await verifyPasswordHash(user.passwordHash, currentPassword);

			if (!currentPasswordIsCorrect || newPassword !== newPasswordConfirmation) {
				const message = currentPasswordIsCorrect
					? "Password confirmation doesn't match the password"
					: 'Current password is incorrect.';

				return fail(400, {
					updatePasswordForm,
					message: message
				});
			}

			const newPasswordHash = await hashPassword(newPassword);

			await updateUserPassword(database, user.username, newPasswordHash);

			return {
				updatePasswordForm,
				message: 'Successfully updated password!'
			};
		} catch (err) {
			return fail(400, {
				updatePasswordForm,
				message: `Failed to update password: ${(err as Error).message}`
			});
		}
	},
};
