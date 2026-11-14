import { useOptimistic } from 'react';
import { 
  ChevronRight, 
  Scale, 
  Coins, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Ban 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Order, OrderStatus } from '@/types';
import { formatCurrency, formatWeight, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradePill } from '@/components/ui/GradePill';
import { getAllowedOrderActions, type OrderAction } from '../stateMachine';

interface OrderCardProps {
  order: Order;
  role: 'farmer' | 'buyer';
  onViewDetails: (order: Order) => void;
  onActionSelect: (order: Order, action: OrderAction) => void;
}

export function OrderCard({
  order,
  role,
  onViewDetails,
  onActionSelect,
}: OrderCardProps) {
  const { t } = useTranslation();
  // React 19 useOptimistic for responsive order status updates
  const [optimisticStatus] = useOptimistic(
    order.status,
    (_currentStatus: OrderStatus, newStatus: OrderStatus) => newStatus
  );

  const allowedActions = getAllowedOrderActions({ ...order, status: optimisticStatus }, role);
  const counterparty = role === 'farmer' ? order.buyerId : order.farmerId;
  const counterpartyPrefix = role === 'farmer' ? t('roles.buyer', 'Buyer') : t('roles.farmer', 'Farmer');

  const actionIcons = {
    accept: CheckCircle2,
    reject: XCircle,
    complete: Truck,
    cancel: Ban,
  };

  const actionLabels: Record<string, string> = {
    accept: t('orders.acceptOrder', 'Accept Order'),
    reject: t('orders.rejectOrder', 'Reject Order'),
    complete: t('orders.completeOrder', 'Complete Order'),
    cancel: t('orders.cancelOrder', 'Cancel Order'),
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-brand-500 hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
          <div>
            <span className="text-xs font-black tracking-wider text-stone-500 dark:text-stone-400">
              ORDER #{order._id.slice(-6).toUpperCase()}
            </span>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={optimisticStatus} />
        </div>

        {/* Produce & Quantity Info */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {order.productId?.name || 'Fresh Produce Lot'}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <GradePill grade={order.productId?.grade || 'A'} size="sm" />
              <span className="text-xs text-stone-500">
                {formatCurrency(order.pricePerKg)}/kg
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-500 dark:text-stone-400">{t('orders.totalLotValue', 'Total Lot Value')}</span>
            <p className="text-base font-black text-brand-700 dark:text-brand-400">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Quantities & Counterparty Row */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <Scale className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
            <span className="shrink-0">{t('common.quantity', 'Volume')}:</span>
            <strong className="truncate text-stone-900 dark:text-stone-100">
              {formatWeight(order.quantity)}
            </strong>
          </div>

          <div className="flex items-center justify-end gap-1.5 min-w-0">
            <Coins className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="shrink-0">{counterpartyPrefix}:</span>
            <strong className="truncate max-w-[85px] sm:max-w-[120px] text-stone-900 dark:text-stone-100">
              {counterparty?.name || 'Authorized'}
            </strong>
          </div>
        </div>

        {/* Delivery Address snippet */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
          <span className="line-clamp-1">{order.deliveryAddress}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-stone-100 pt-3 dark:border-stone-800">
        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="inline-flex h-10 items-center justify-center sm:justify-start gap-1 text-xs font-bold text-stone-700 hover:text-brand-700 dark:text-stone-300 dark:hover:text-brand-400"
        >
          <span>{t('orders.viewDetailsTimeline', 'View Details & Timeline')}</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Quick action triggers */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {allowedActions.map((action) => {
            const Icon = actionIcons[action.action];
            const isDanger = action.variant === 'danger';
            const label = actionLabels[action.action] || action.label;

            return (
              <button
                key={action.action}
                type="button"
                onClick={() => onActionSelect(order, action)}
                className={`flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all shadow-xs focus:ring-2 focus:outline-hidden ${
                  isDanger
                    ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500/20 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                    : 'bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
