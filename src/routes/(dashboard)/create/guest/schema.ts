import { z } from 'zod';
import { nameRegExp, nameRegExpMsg } from '$lib/utils/regexp';
import { optionalGuarantor, optionalUniversity } from '$lib/utils/env';

export const createFormSchema = z.object({
	fname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	lname: z.string().min(1).max(50).regex(nameRegExp, nameRegExpMsg),
	identifier: z.string().min(4),
	university: optionalUniversity ? z.string().optional() : z.string(),
	guarantorId: optionalGuarantor ? z.number().optional() : z.number()
});
export type CreateFormSchema = typeof createFormSchema;

export const guarantorSearchFormSchema = z.object({
	guarantorSearchQuery: z.string().optional()
});
export type GuarantorSearchFormSchema = typeof guarantorSearchFormSchema;
