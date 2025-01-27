import { env } from '$env/dynamic/public';

export const guarantorEligibilityHours = Number.parseInt(
	env.PUBLIC_GUARANTOR_ELIGIBILITY_HOURS ?? '80'
);
