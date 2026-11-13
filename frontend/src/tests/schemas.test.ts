import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../features/auth/schemas';
import { productFormSchema, productEditSchema } from '../features/products/schemas';
import { createOrderSchema } from '../features/orders/schemas';

describe('Zod Schema Validation Tests', () => {
  describe('Auth Schemas', () => {
    it('validates correct login credentials', () => {
      const valid = { email: 'farmer@demo.com', password: 'password123' };
      const parsed = loginSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid email on login', () => {
      const invalid = { email: 'not-an-email', password: 'password123' };
      const parsed = loginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it('validates farmer and buyer registration inputs', () => {
      const validFarmer = {
        name: 'Suresh Patil',
        email: 'suresh@mandi.in',
        password: 'password123',
        role: 'farmer',
        location: 'Solapur, Maharashtra',
      };
      expect(registerSchema.safeParse(validFarmer).success).toBe(true);

      const validBuyer = {
        name: 'Reliance Wholesale',
        email: 'procure@reliance.in',
        password: 'password123',
        role: 'buyer',
        location: 'Mumbai APMC',
      };
      expect(registerSchema.safeParse(validBuyer).success).toBe(true);
    });
  });

  describe('Product Schemas', () => {
    it('validates produce listing form with valid grade and positive price', () => {
      const validLot = {
        name: 'Solapur Hybrid Tomatoes',
        quantity: 500,
        pricePerKg: 35,
        grade: 'A',
        status: 'available',
      };
      expect(productFormSchema.safeParse(validLot).success).toBe(true);
    });

    it('rejects invalid produce grade', () => {
      const invalidLot = {
        name: 'Tomatoes',
        quantity: 100,
        pricePerKg: 30,
        grade: 'D', // Only A, B, C allowed
      };
      expect(productFormSchema.safeParse(invalidLot).success).toBe(false);
    });

    it('rejects zero or negative quantities on create', () => {
      const zeroQty = {
        name: 'Tomatoes',
        quantity: 0,
        pricePerKg: 30,
        grade: 'A',
      };
      expect(productFormSchema.safeParse(zeroQty).success).toBe(false);
    });

    it('allows 0 stock on edit to support sold-out state', () => {
      const zeroQtyEdit = {
        name: 'Tomatoes',
        quantity: 0,
        pricePerKg: 30,
        status: 'sold_out',
      };
      expect(productEditSchema.safeParse(zeroQtyEdit).success).toBe(true);
    });
  });

  describe('Order Schemas', () => {
    it('validates purchase order placement input', () => {
      const validOrder = {
        productId: 'prod_123',
        quantity: 150,
        deliveryAddress: 'Pune APMC Market Yard, Shed 12',
      };
      expect(createOrderSchema.safeParse(validOrder).success).toBe(true);
    });

    it('rejects delivery addresses shorter than 5 characters', () => {
      const invalidAddress = {
        productId: 'prod_123',
        quantity: 150,
        deliveryAddress: 'APMC',
      };
      expect(createOrderSchema.safeParse(invalidAddress).success).toBe(false);
    });
  });
});

