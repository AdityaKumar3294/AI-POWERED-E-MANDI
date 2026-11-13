import { z } from 'zod';

export const createCertificateDialogSchema = z.object({
  produceName: z
    .string()
    .min(2, 'Produce name must be at least 2 characters')
    .max(80, 'Produce name must be under 80 characters')
    .default('Tomatoes'),
});

export type CreateCertificateDialogInput = z.infer<typeof createCertificateDialogSchema>;

