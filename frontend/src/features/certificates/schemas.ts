import { z } from 'zod';

export const verifyCertificateParamsSchema = z.object({
  certificateId: z.string().min(1, 'Certificate ID is required'),
});

export type VerifyCertificateParams = z.infer<typeof verifyCertificateParamsSchema>;

