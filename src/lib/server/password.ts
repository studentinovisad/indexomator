import { hash, verify } from '@node-rs/argon2';
import { sha1 } from '@oslojs/crypto/sha1';
import { encodeHexLowerCase } from '@oslojs/encoding';

export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export async function verifyPasswordHash(hash: string, password: string): Promise<boolean> {
	return await verify(hash, password);
}

export async function verifyPasswordStrength(password: string): Promise<boolean> {
	try {
		const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
		const hashPrefix = hash.slice(0, 5);

		let data: string;
		try {
			const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
			data = await response.text();
		} catch (err: unknown) {
			throw new Error(`Failed to fetch api.pwnedpasswords.com: ${JSON.stringify(err)}`);
		}

		const items = data.split('\n');
		for (const item of items) {
			const hashSuffix = item.slice(0, 35).toLowerCase();
			if (hash === hashPrefix + hashSuffix) {
				return false;
			}
		}

		return true;
	} catch (err: unknown) {
		throw new Error(`Failed to check password strength: ${JSON.stringify(err)}`);
	}
}
