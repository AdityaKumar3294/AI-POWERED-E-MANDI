import { z } from 'zod';

export const productFilterSchema = z.object({
  search: z.string().optional(),
  grade: z.enum(['A', 'B', 'C']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'pricePerKg', 'name', 'quantity']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ProductFilterParams = z.infer<typeof productFilterSchema>;

export const productFormSchema = z.object({
  name: z
    .string({ required_error: 'Produce name is required' })
    .trim()
    .min(2, 'Produce name must be at least 2 characters')
    .max(100, 'Produce name cannot exceed 100 characters'),
  quantity: z.coerce
    .number({ required_error: 'Quantity is required' })
    .positive('Quantity must be greater than 0 kg'),
  pricePerKg: z.coerce
    .number({ required_error: 'Price per kg is required' })
    .positive('Price must be greater than ₹0 per kg'),
  grade: z.enum(['A', 'B', 'C'], {
    required_error: 'Produce grade is required',
  }),
  certificateId: z.string().optional().nullable(),
  gradingReportId: z.string().optional().nullable(),
  status: z.enum(['available', 'sold_out', 'inactive']).default('available'),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const productEditSchema = z.object({
  name: z
    .string({ required_error: 'Produce name is required' })
    .trim()
    .min(2, 'Produce name must be at least 2 characters')
    .max(100, 'Produce name cannot exceed 100 characters'),
  quantity: z.coerce
    .number({ required_error: 'Quantity is required' })
    .min(0, 'Quantity cannot be negative'),
  pricePerKg: z.coerce
    .number({ required_error: 'Price per kg is required' })
    .positive('Price must be greater than ₹0 per kg'),
  grade: z.enum(['A', 'B', 'C']).optional(),
  status: z.enum(['available', 'sold_out', 'inactive']).default('available'),
});

export type ProductEditInput = z.infer<typeof productEditSchema>;
