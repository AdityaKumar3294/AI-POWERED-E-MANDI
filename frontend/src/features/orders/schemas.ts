import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .coerce
    .number()
    .min(1, 'Quantity must be at least 1 kg')
    .int('Quantity must be a whole number'),
  deliveryAddress: z
    .string()
    .min(5, 'Delivery address must be at least 5 characters')
    .max(250, 'Address is too long'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

