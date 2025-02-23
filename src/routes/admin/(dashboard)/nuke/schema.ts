import { z } from 'zod';

export const formSchema = z.object({
	building: z.string(),
	personType: z.string()
});

export type FormSchema = typeof formSchema;
