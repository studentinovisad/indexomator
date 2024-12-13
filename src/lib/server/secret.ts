import { env } from '$env/dynamic/private';
import { hashPassword, verifyPasswordHash } from './password';

export async function validateSecret(secret: string): Promise<boolean> {
	// Assert that the secret is valid
	if (secret === null || secret === undefined || secret === '') {
		throw new Error('Invalid secret');
	}

	// Assert that the secret env exists
	if (env.SECRET === null || env.SECRET === undefined || env.SECRET === '') {
		throw new Error('SECRET env is not defined or empty string');
	}

	const secretHash = await hashPassword(env.SECRET);
	return await verifyPasswordHash(secretHash, secret);
}
