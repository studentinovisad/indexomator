import { env } from '$env/dynamic/private';

export function validateSecret(secret: string): boolean {
	// Assert that the secret is valid
	if (secret === undefined || secret === null || secret === '') {
		throw new Error('Invalid secret');
	}

	// Assert that the secret env exists
	if (env.SECRET === undefined) {
		throw new Error('SECRET env is not defined');
	}

	if (secret === env.SECRET) {
		return true;
	} else {
		return false;
	}
}
