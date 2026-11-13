import type { Order, OrderStatus } from '@/types';

export interface OrderAction {
  action: 'accept' | 'reject' | 'complete' | 'cancel';
  targetStatus: OrderStatus;
  label: string;
  variant: 'primary' | 'danger' | 'warning';
  destructive: boolean;
  confirmTitle: string;
  confirmDescription: string;
}

/**
 * Valid order status transitions according to the E-Mandi state machine.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed'],
  rejected: [],
  completed: [],
  cancelled: [],
};

/**
 * Checks whether an order status transition is allowed for a given role.
 */
export function canTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  role: 'farmer' | 'buyer'
): boolean {
  if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(targetStatus)) {
    return false;
  }

  if (role === 'farmer') {
    return ['confirmed', 'rejected', 'completed'].includes(targetStatus);
  }

  if (role === 'buyer') {
    return targetStatus === 'cancelled';
  }

  return false;
}

/**
 * Returns the list of role-gated executable actions on an order.
 */
export function getAllowedOrderActions(order: Order, role: 'farmer' | 'buyer'): OrderAction[] {
  const actions: OrderAction[] = [];
  const status = order.status;

  if (role === 'farmer') {
    if (status === 'pending') {
      actions.push({
        action: 'accept',
        targetStatus: 'confirmed',
        label: 'Accept Order',
        variant: 'primary',
        destructive: false,
        confirmTitle: 'Accept Wholesale Order?',
        confirmDescription: `Are you sure you want to accept this order for ${order.quantity} kg of ${
          order.productId?.name || 'produce'
        }? The buyer will be notified to prepare delivery receipt.`,
      });
      actions.push({
        action: 'reject',
        targetStatus: 'rejected',
        label: 'Reject Order',
        variant: 'danger',
        destructive: true,
        confirmTitle: 'Reject Wholesale Order?',
        confirmDescription: `Are you sure you want to reject this order? The reserved inventory of ${order.quantity} kg will immediately be returned to your available stock.`,
      });
    } else if (status === 'confirmed') {
      actions.push({
        action: 'complete',
        targetStatus: 'completed',
        label: 'Mark Dispatched / Delivered',
        variant: 'primary',
        destructive: false,
        confirmTitle: 'Complete and Dispatch Order?',
        confirmDescription: `Confirm that the harvest consignment has been dispatched or handed over to the buyer. This will finalize the order transaction.`,
      });
    }
  } else if (role === 'buyer') {
    if (status === 'pending') {
      actions.push({
        action: 'cancel',
        targetStatus: 'cancelled',
        label: 'Cancel Order',
        variant: 'danger',
        destructive: true,
        confirmTitle: 'Cancel This Order?',
        confirmDescription: `Are you sure you want to cancel your order for ${order.quantity} kg of ${
          order.productId?.name || 'produce'
        }? Your reservation will be released back to the farmer.`,
      });
    }
  }

  return actions;
}
