import { useState, useMemo, useTransition } from 'react';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  Truck, 
  Coins, 
  AlertCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrders, useUpdateOrderStatus } from '../hooks';
import { OrderCard } from '../components/OrderCard';
import { OrderDetailDrawer } from '../components/OrderDetailDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';
import type { Order } from '@/types';
import type { OrderAction } from '../stateMachine';

type FilterTab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled_rejected';

export default function FarmerOrdersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    order: Order;
    action: OrderAction;
  } | null>(null);

  const orders = data?.orders || [];

  // Metrics summary
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;
    const cancelledCount = orders.filter((o) => ['cancelled', 'rejected'].includes(o.status)).length;
    const totalRevenue = orders
      .filter((o) => ['confirmed', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalCount,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalRevenue,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let matchesTab = true;
      if (activeTab === 'cancelled_rejected') {
        matchesTab = order.status === 'cancelled' || order.status === 'rejected';
      } else if (activeTab !== 'all') {
        matchesTab = order.status === activeTab;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order._id.toLowerCase().includes(q) ||
        (order.productId?.name && order.productId.name.toLowerCase().includes(q)) ||
        (order.buyerId?.name && order.buyerId.name.toLowerCase().includes(q)) ||
        (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const handleActionSelect = (order: Order, action: OrderAction) => {
    setPendingAction({ order, action });
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { order, action } = pendingAction;

    startTransition(() => {
      updateStatusMutation.mutate(
        { id: order._id, status: action.targetStatus },
        {
          onSuccess: (updatedData) => {
            if (selectedOrder && selectedOrder._id === order._id) {
              setSelectedOrder(updatedData.order);
            }
            setPendingAction(null);
          },
          onError: () => {
            setPendingAction(null);
          },
        }
      );
    });
  };

  return (
    <div className="space-y-6">
      <title>{t('orders.farmerTitle', 'Wholesale Buyer Orders')} | {t('brand', 'AI E-Mandi')}</title>
      <meta
        name="description"
        content="Review, accept, and manage wholesale buyer orders for your farm produce on AI-Powered E-Mandi."
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
          {t('orders.farmerTitle', 'Wholesale Buyer Orders')}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {t('orders.farmerSubtitle', 'Review incoming buyer purchase requests, accept consignments, and coordinate delivery handovers.')}
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <ClipboardList className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">{t('orders.totalOrders', 'Total Received')}</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-100">
            {metrics.totalCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">{t('orders.awaitingAcceptance', 'Awaiting Review')}</span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">
            {metrics.pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">{t('orders.confirmedOrders', 'Accepted Orders')}</span>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-400">
            {metrics.confirmedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">{t('orders.confirmedRevenue', 'Confirmed Revenue')}</span>
          </div>
          <p className="mt-2 text-xl font-black text-brand-700 dark:text-brand-400">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs md:flex-row md:items-center md:justify-between dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            {t('orders.all', 'All')} ({metrics.totalCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            🟡 {t('orders.pending', 'Pending')} ({metrics.pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('confirmed')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'confirmed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            🔵 {t('orders.confirmed', 'Confirmed')} ({metrics.confirmedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            🟢 {t('orders.completed', 'Completed')} ({metrics.completedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled_rejected')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'cancelled_rejected'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            {t('orders.cancelledRejected', 'Cancelled / Rejected')} ({metrics.cancelledCount})
          </button>
        </div>

        <div className="relative min-w-[240px] md:max-w-xs">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('orders.searchPlaceholder', 'Search order #, produce, or buyer...')}
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:focus:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
          />
        </div>
      </div>

      {/* Main Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
            >
              <Skeleton className="h-5 w-1/3" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={t('common.error', 'Failed to Load Orders')}
          message="Could not retrieve incoming orders from the mandi server. Please verify your connection."
          onRetry={refetch}
        />
      ) : filteredOrders.length === 0 ? (
        orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t('orders.noOrdersFound', 'No Consignment Orders Yet')}
            description={t('orders.emptyFarmerMessage', 'You have not received any wholesale purchase requests yet. Make sure your produce lots are marked available.')}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-stone-700 dark:bg-stone-900">
            <AlertCircle className="h-12 w-12 text-stone-400" />
            <h3 className="mt-3 text-lg font-bold text-stone-800 dark:text-stone-200">
              {t('orders.noOrdersFound', 'No matching orders found')}
            </h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Try adjusting your search query or selecting another status tab.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="mt-4 text-xs font-bold text-brand-700 underline dark:text-brand-400"
            >
              Reset Filters
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              role="farmer"
              onViewDetails={(o) => setSelectedOrder(o)}
              onActionSelect={handleActionSelect}
            />
          ))}
        </div>
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        role="farmer"
        onClose={() => setSelectedOrder(null)}
        onActionSelect={handleActionSelect}
      />

      {/* Confirmation Dialog for Destructive / Final Actions */}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.action.confirmTitle || 'Confirm Action'}
        description={pendingAction?.action.confirmDescription || ''}
        confirmLabel={
          updateStatusMutation.isPending
            ? t('common.loading', 'Updating...')
            : pendingAction?.action.label || 'Confirm'
        }
        variant={pendingAction?.action.variant || 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
