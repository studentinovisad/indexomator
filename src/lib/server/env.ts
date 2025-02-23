import { env } from '$env/dynamic/private';

export const databaseUrl = env.DATABASE_URL;
export const migrationsPath = env.MIGRATIONS_PATH;

export const secret = env.SECRET;

export const adminInactivityTimeout =
	Number.parseInt(env.ADMIN_INACTIVITY_TIMEOUT ?? '30') * 60 * 1000;
export const inactivityTimeout = Number.parseInt(env.INACTIVITY_TIMEOUT ?? '120') * 60 * 1000;
export const maxActiveSessions = Number.parseInt(env.MAX_ACTIVE_SESSIONS ?? '3');

export const ratelimitMaxAttempts = Number.parseInt(env.RATELIMIT_MAX_ATTEMPTS ?? '5');
export const ratelimitTimeout = Number.parseInt(env.RATELIMIT_TIMEOUT ?? '60');

export const hoursSpentCutoffHours = Number.parseInt(env.HOURS_SPENT_CUTOFF_HOURS ?? '24');
