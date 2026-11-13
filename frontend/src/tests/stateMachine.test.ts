import { describe, it, expect } from 'vitest';
import { canTransition, getAllowedOrderActions } from '../features/orders/stateMachine';
import type { Order } from '@/types';

describe('Order State Machine', () => {
  const baseOrder: Order = {
    _id: 'ord_123456789',
    buyerId: { id: 'u_buyer', name: 'Buyer Ramesh', email: 'buyer@demo.com', role: 'buyer', location: 'Pune' },
    farmerId: { id: 'u_farmer', name: 'Farmer Suresh', email: 'farmer@demo.com', role: 'farmer', location: 'Solapur' },
    productId: {
      _id: 'prod_999',
      farmerId: { id: 'u_farmer', name: 'Farmer Suresh', email: 'farmer@demo.com', role: 'farmer', location: 'Solapur' },
      name: 'Fresh Hybrid Tomatoes',
      quantity: 500,
      pricePerKg: 30,
      grade: 'A',
      status: 'available',
      createdAt: '2026-11-13T10:00:00Z',
      updatedAt: '2026-11-13T10:00:00Z',
    },
    quantity: 100,
    pricePerKg: 30,
    totalAmount: 3000,
    status: 'pending',
    deliveryAddress: 'Pune APMC Mandi, Yard 4',
    createdAt: '2026-11-13T10:00:00Z',
    updatedAt: '2026-11-13T10:00:00Z',
  };

  describe('Farmer Allowed Transitions', () => {
    it('allows farmer to accept pending order into confirmed status', () => {
      expect(canTransition('pending', 'confirmed', 'farmer')).toBe(true);
      const actions = getAllowedOrderActions({ ...baseOrder, status: 'pending' }, 'farmer');
      const acceptAction = actions.find((a) => a.action === 'accept');
      expect(acceptAction).toBeDefined();
      expect(acceptAction?.targetStatus).toBe('confirmed');
    });

    it('allows farmer to reject pending order into rejected status', () => {
      expect(canTransition('pending', 'rejected', 'farmer')).toBe(true);
      const actions = getAllowedOrderActions({ ...baseOrder, status: 'pending' }, 'farmer');
      const rejectAction = actions.find((a) => a.action === 'reject');
      expect(rejectAction).toBeDefined();
      expect(rejectAction?.destructive).toBe(true);
    });

    it('allows farmer to complete confirmed order', () => {
      expect(canTransition('confirmed', 'completed', 'farmer')).toBe(true);
      const actions = getAllowedOrderActions({ ...baseOrder, status: 'confirmed' }, 'farmer');
      const completeAction = actions.find((a) => a.action === 'complete');
      expect(completeAction).toBeDefined();
      expect(completeAction?.targetStatus).toBe('completed');
    });

    it('disallows farmer from cancelling orders or moving backwards', () => {
      expect(canTransition('pending', 'cancelled', 'farmer')).toBe(false);
      expect(canTransition('confirmed', 'pending', 'farmer')).toBe(false);
      expect(canTransition('completed', 'confirmed', 'farmer')).toBe(false);
    });
  });

  describe('Buyer Allowed Transitions', () => {
    it('allows buyer to cancel pending order', () => {
      expect(canTransition('pending', 'cancelled', 'buyer')).toBe(true);
      const actions = getAllowedOrderActions({ ...baseOrder, status: 'pending' }, 'buyer');
      const cancelAction = actions.find((a) => a.action === 'cancel');
      expect(cancelAction).toBeDefined();
      expect(cancelAction?.targetStatus).toBe('cancelled');
    });

    it('disallows buyer from confirming or completing orders', () => {
      expect(canTransition('pending', 'confirmed', 'buyer')).toBe(false);
      expect(canTransition('pending', 'completed', 'buyer')).toBe(false);
      expect(canTransition('confirmed', 'completed', 'buyer')).toBe(false);
    });

    it('disallows buyer from cancelling an already confirmed order', () => {
      expect(canTransition('confirmed', 'cancelled', 'buyer')).toBe(false);
      const actions = getAllowedOrderActions({ ...baseOrder, status: 'confirmed' }, 'buyer');
      expect(actions.length).toBe(0);
    });
  });

  describe('Terminal States', () => {
    it('disallows any transitions once order is completed, rejected, or cancelled', () => {
      const terminalStatuses = ['completed', 'rejected', 'cancelled'] as const;

      terminalStatuses.forEach((status) => {
        expect(getAllowedOrderActions({ ...baseOrder, status }, 'farmer')).toEqual([]);
        expect(getAllowedOrderActions({ ...baseOrder, status }, 'buyer')).toEqual([]);
      });
    });
  });
});

