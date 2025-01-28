import { env } from '$env/dynamic/private';

export const hoursSpentCutoffHours = Number.parseInt(env.HOURS_SPENT_CUTOFF_HOURS ?? '24');
