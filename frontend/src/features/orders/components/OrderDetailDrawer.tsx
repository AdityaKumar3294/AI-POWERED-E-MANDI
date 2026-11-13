import { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Mail, 
  Scale, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Ban 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Order } from '@/types';
import { formatCurrency, formatWeight, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradePill } from '@/components/ui/GradePill';
import { OrderTimeline } from './OrderTimeline';
import { getAllowedOrderActions, type OrderAction } from '../stateMachine';

interface OrderDetailDrawerProps {
  open: boolean;
  order: Order | null;
  role: 'farmer' | 'buyer';
  onClose: () => void;
  onActionSelect: (order: Order, action: OrderAction) => void;
}

export function OrderDetailDrawer({
  open,
  order,
  role,
  onClose,
  onActionSelect,
}: OrderDetailDrawerProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !order) return null;

  const allowedActions = getAllowedOrderActions(order, role);

  const counterparty = role === 'farmer' ? order.buyerId : order.farmerId;
  const counterpartyRoleLabel = role === 'farmer' 
    ? t('orders.wholesaleBuyer', 'Wholesale Buyer') 
    : t('orders.producerFarmer', 'Producer Farmer');

  const actionIcons = {
    accept: CheckCircle2,
    reject: XCircle,
    complete: Truck,
    cancel: Ban,
  };

  const actionLabels: Record<string, string> = {
    accept: t('orders.acceptOrder', 'Accept Order'),
    reject: t('orders.rejectOrder', 'Reject Order'),
    complete: t('orders.completeOrder', 'Complete Delivery'),
    cancel: t('orders.cancelOrder', 'Cancel Order'),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative flex w-screen max-w-md flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 dark:bg-stone-900">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-5 py-4 backdrop-blur-xs dark:border-stone-800 dark:bg-stone-900/95">
            <div>
              <div className="flex items-center gap-2">
                <h3 id="order-drawer-title" className="text-base font-black text-stone-900 dark:text-stone-100">
                  ORDER #{order._id.slice(-6).toUpperCase()}
                </h3>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="touch-target flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 space-y-6 p-5">
            {/* Produce Lot Card */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-800/40">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t('orders.produceConsignment', 'Produce Consignment')}
              </span>

              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {order.productId?.name || 'Fresh Produce'}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <GradePill grade={order.productId?.grade || 'A'} size="sm" />
                    <span className="text-xs text-stone-500">Wholesale Batch</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-xs text-stone-500 dark:text-stone-400">{t('orders.ratePerKg', 'Rate / Kg')}</span>
                  <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    {formatCurrency(order.pricePerKg)}
                  </span>
                </div>
              </div>

              {/* Order Quantities and Total Breakdown */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-200/80 pt-3 text-xs dark:border-stone-700/80">
                <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                  <Scale className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span>{t('common.quantity', 'Quantity')}:</span>
                  <strong className="text-stone-900 dark:text-stone-100">
                    {formatWeight(order.quantity)}
                  </strong>
                </div>

                <div className="flex items-center justify-end gap-1.5 text-stone-600 dark:text-stone-300">
                  <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>{t('orders.totalLotValue', 'Total Amount')}:</span>
                  <strong className="text-sm font-black text-brand-700 dark:text-brand-400">
                    {formatCurrency(order.totalAmount)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Counterparty & Delivery Details */}
            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {counterpartyRoleLabel}
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                  <User className="h-4 w-4 text-stone-400" />
                  <span className="font-semibold">{counterparty?.name || 'Authorized Member'}</span>
                </div>

                {counterparty?.email && (
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <span>{counterparty.email}</span>
                  </div>
                )}

                {counterparty?.location && (
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <span>Location: {counterparty.location}</span>
                  </div>
                )}

                <div className="border-t border-stone-100 pt-2 dark:border-stone-800">
                  <span className="block font-semibold text-stone-700 dark:text-stone-300">
                    {t('orders.deliveryAddress', 'Delivery Address:')}
                  </span>
                  <p className="mt-1 rounded-lg bg-stone-50 p-2.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Progress Timeline */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <span className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t('orders.orderProgressTimeline', 'ORDER PROGRESS TIMELINE')}
              </span>
              <OrderTimeline order={order} />
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="sticky bottom-0 border-t border-stone-200 bg-stone-50/95 p-4 backdrop-blur-xs dark:border-stone-800 dark:bg-stone-900/95">
            {allowedActions.length > 0 ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                {allowedActions.map((action) => {
                  const Icon = actionIcons[action.action];
                  const buttonStyles = {
                    primary:
                      'bg-brand-700 text-white hover:bg-brand-800 shadow-sm focus:ring-brand-500',
                    danger:
                      'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500',
                    warning:
                      'bg-amber-600 text-white hover:bg-amber-700 shadow-sm focus:ring-amber-500',
                  };
                  const label = actionLabels[action.action] || action.label;

                  return (
                    <button
                      key={action.action}
                      type="button"
                      onClick={() => onActionSelect(order, action)}
                      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all focus:ring-2 focus:outline-hidden ${buttonStyles[action.variant]}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {order.status === 'completed'
                    ? '✓ Order transaction complete. Consignment verified.'
                    : order.status === 'cancelled'
                    ? '✕ Order was cancelled. Stock released.'
                    : order.status === 'rejected'
                    ? '✕ Order was rejected by farmer.'
                    : 'Order in progress with delivery fulfillment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
