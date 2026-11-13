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
  // React 19 useOptimistic for responsive order status updates
  const [optimisticStatus] = useOptimistic(
    order.status,
    (_currentStatus: OrderStatus, newStatus: OrderStatus) => newStatus
  );

  const allowedActions = getAllowedOrderActions({ ...order, status: optimisticStatus }, role);
  const counterparty = role === 'farmer' ? order.buyerId : order.farmerId;
  const counterpartyPrefix = role === 'farmer' ? 'Buyer' : 'Farmer';

  const actionIcons = {
    accept: CheckCircle2,
    reject: XCircle,
    complete: Truck,
    cancel: Ban,
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
            <span className="text-xs text-stone-500 dark:text-stone-400">Total Lot Value</span>
            <p className="text-base font-black text-brand-700 dark:text-brand-400">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Quantities & Counterparty Row */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
          <div className="flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>Volume:</span>
            <strong className="text-stone-900 dark:text-stone-100">
              {formatWeight(order.quantity)}
            </strong>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{counterpartyPrefix}:</span>
            <strong className="line-clamp-1 max-w-[100px] text-stone-900 dark:text-stone-100">
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
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="inline-flex h-10 items-center gap-1 text-xs font-bold text-stone-700 hover:text-brand-700 dark:text-stone-300 dark:hover:text-brand-400"
        >
          <span>View Details & Timeline</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Quick action triggers */}
        <div className="flex items-center gap-1.5">
          {allowedActions.map((action) => {
            const Icon = actionIcons[action.action];
            const isDanger = action.variant === 'danger';

            return (
              <button
                key={action.action}
                type="button"
                onClick={() => onActionSelect(order, action)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all shadow-xs focus:ring-2 focus:outline-hidden ${
                  isDanger
                    ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500/20 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                    : 'bg-brand-700 text-white hover:bg-brand-800 focus:ring-brand-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
