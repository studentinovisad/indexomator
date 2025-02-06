import { env } from '$env/dynamic/public';

export const guarantorEligibilityHours = Number.parseInt(
	env.PUBLIC_GUARANTOR_ELIGIBILITY_HOURS ?? '0'
);

export const rectorateMode = env.PUBLIC_RECTORATE_MODE === 'true' ? true : false;
