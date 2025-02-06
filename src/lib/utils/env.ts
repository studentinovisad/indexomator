import { env } from '$env/dynamic/public';

export const indexRegex = env.PUBLIC_INDEX_REGEX ?? /^\d{1,4}[a-zA-Z]?\/(?:\d{2}|\d{4})$/;

export const guarantorEligibilityHours = Number.parseInt(
	env.PUBLIC_GUARANTOR_ELIGIBILITY_HOURS ?? '0'
);

export const rectorateMode = env.PUBLIC_RECTORATE_MODE === 'true' ? true : false;

export const optionalDepartment = env.PUBLIC_OPTIONAL_DEPARTMENT === 'true' ? true : false;
export const optionalUniversity = env.PUBLIC_OPTIONAL_UNIVERSITY === 'true' ? true : false;
export const optionalGuarantor = env.PUBLIC_OPTIONAL_GUARANTOR === 'true' ? true : false;
