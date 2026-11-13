import { Link } from 'react-router-dom';
import { ChevronRight, Package, User } from 'lucide-react';
import type { Order } from '@/types';
import { formatCurrency, formatWeight, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradePill } from '@/components/ui/GradePill';

interface RecentOrdersTableProps {
  orders: Order[];
  role: 'farmer' | 'buyer';
}

export function RecentOrdersTable({ orders, role }: RecentOrdersTableProps) {
  const ordersPortalUrl = role === 'farmer' ? '/farmer/orders' : '/buyer/orders';
  const counterpartyTitle = role === 'farmer' ? 'Buyer' : 'Farmer';

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
        <Package className="h-10 w-10 text-stone-400" />
        <h4 className="mt-2 text-sm font-bold text-stone-800 dark:text-stone-200">
          No Recent Orders Found
        </h4>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Transactions will automatically appear here once new orders are placed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Recent Order Activity
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Latest mandi purchase requests and transaction updates.
          </p>
        </div>

        <Link
          to={ordersPortalUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400"
        >
          <span>View All</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-400">
            <tr>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-4 py-3">Produce Lot</th>
              <th className="px-4 py-3">{counterpartyTitle}</th>
              <th className="px-4 py-3 text-right">Volume</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-stone-800 dark:divide-stone-800 dark:text-stone-200">
            {orders.map((order) => {
              const counterparty = role === 'farmer' ? order.buyerId : order.farmerId;

              return (
                <tr
                  key={order._id}
                  className="transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-800/40"
                >
                  <td className="px-5 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                    <Link
                      to={ordersPortalUrl}
                      className="hover:underline hover:text-brand-700 dark:hover:text-brand-400"
                    >
                      #{order._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <GradePill grade={order.productId?.grade || 'A'} size="sm" />
                      <span className="font-semibold">{order.productId?.name || 'Produce'}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-stone-400" />
                      <span>{counterparty?.name || 'Authorized User'}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-semibold">
                    {formatWeight(order.quantity)}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-brand-700 dark:text-brand-400">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-5 py-3 text-right text-stone-500 dark:text-stone-400">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

