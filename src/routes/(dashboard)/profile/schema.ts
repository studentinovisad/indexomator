import { z } from 'zod';

export const updatePasswordFormSchema = z.object({
	currentPassword: z.string().min(8).max(255),
	newPassword: z.string().min(8).max(255),
	newPasswordConfirmation: z.string().min(8).max(255)
});
export type UpdatePasswordFormSchema = typeof updatePasswordFormSchema;
