import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(50, 'Name must be under 50 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  role: z
    .enum(['farmer', 'buyer'], {
      required_error: 'Please select a role',
    }),
  location: z
    .string()
    .min(2, 'Location is required (e.g., District / City, State)')
    .max(100, 'Location too long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

