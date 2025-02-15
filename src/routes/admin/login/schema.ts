import { z } from 'zod';

export const adminLoginSchema = z.object({
    secret: z.string().min(32).max(255)
});

export type AdminLoginSchema = typeof adminLoginSchema;
