import { env } from '$env/dynamic/private';
import { hashPassword, verifyPasswordHash } from './password';

const secretHash = await hashPassword(env.SECRET);

export async function validateSecret(secret: string): Promise<boolean> {
	// Assert that the secret is valid
	if (secret === undefined || secret === null || secret === '') {
		throw new Error('Invalid secret');
	}

	// Assert that the secret env exists
	if (env.SECRET === undefined) {
		throw new Error('SECRET env is not defined');
	}

	return await verifyPasswordHash(secretHash, secret);
}
