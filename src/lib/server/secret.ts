import { env } from '$env/dynamic/private';
import { hashPassword, verifyPasswordHash } from './password';

export async function validateSecret(secret: string): Promise<boolean> {
	// Assert that the secret is valid
	if (secret === null || secret === undefined || secret === '') {
		throw new Error('Invalid secret');
	}

	const secretEnv = env.SECRET;
	// Assert that the secret env exists
	if (secretEnv === null || secretEnv === undefined || secretEnv === '') {
		throw new Error('SECRET env is not defined or empty string');
	}

	const secretHash = await hashPassword(secretEnv);
	return await verifyPasswordHash(secretHash, secret);
}
