import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  Clock, 
  Truck, 
  Coins, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBuyerDashboard } from '../hooks';
import { useAuthStore } from '@/stores/auth';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { OrderStatusDonut } from '../components/OrderStatusDonut';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';

export default function BuyerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useBuyerDashboard();

  const dashboard = data?.dashboard;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <ErrorState
        title="Dashboard Unavailable"
        message="Could not load your buyer procurement data from the mandi server. Please verify your connection."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-8">
      <title>Buyer Dashboard | AI-Powered E-Mandi</title>
      <meta
        name="description"
        content="Overview of your wholesale agricultural procurements, verified AI quality consignments, order timelines, and expenditure."
      />

      {/* Greeting and Buyer Business Location */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            {t('dashboard.welcome', 'Welcome back')}, {user?.name || 'Wholesale Buyer'}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="truncate">Procurement Center: {user?.location || 'Mandi Hub'} • Wholesale Buyer Account</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link
            to="/buyer/marketplace"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <Store className="h-4 w-4" />
            <span>Browse Marketplace</span>
          </Link>

          <Link
            to="/buyer/orders"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Orders ({dashboard.orders.total})</span>
          </Link>
        </div>
      </div>

      {/* Top Key Metric KPI Cards with Animated Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Completed Spending */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
              Completed Spending
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2 sm:mt-3 text-lg font-black text-emerald-700 sm:text-2xl lg:text-3xl dark:text-emerald-400 truncate">
            <AnimatedCounter
              value={dashboard.spending.completedOrdersAmount}
              formatter={(v) => formatCurrency(v)}
            />
          </p>
          <span className="mt-1 block text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 truncate">
            From fulfilled consignments
          </span>
        </div>

        {/* Total Purchases Placed */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
              Total Orders
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2 sm:mt-3 text-lg font-black text-stone-900 sm:text-2xl lg:text-3xl dark:text-stone-100 truncate">
            <AnimatedCounter value={dashboard.orders.total} />
          </p>
          <span className="mt-1 block text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 truncate">
            All-time wholesale lots
          </span>
        </div>

        {/* Awaiting Acceptance */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
              Awaiting Farmer
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2 sm:mt-3 text-lg font-black text-amber-700 sm:text-2xl lg:text-3xl dark:text-amber-400 truncate">
            <AnimatedCounter value={dashboard.orders.pending} />
          </p>
          <Link
            to="/buyer/orders"
            className="mt-1 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-800 hover:underline dark:text-amber-300"
          >
            <span>Review pending</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Completed Deliveries */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
              Delivered
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2 sm:mt-3 text-lg font-black text-brand-700 sm:text-2xl lg:text-3xl dark:text-brand-400 truncate">
            <AnimatedCounter value={dashboard.orders.completed} />
          </p>
          <span className="mt-1 block text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 truncate">
            Consignments completed
          </span>
        </div>
      </div>

      {/* Middle Section: Orders Donut Chart & Trust/Quality Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Fulfillment Status Donut */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Purchase Order Distribution
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tracking orders from submission through farmer dispatch.
              </p>
            </div>
            <Link
              to="/buyer/orders"
              className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-400"
            >
              Order portal
            </Link>
          </div>

          <div className="mt-6">
            <OrderStatusDonut orders={dashboard.orders} />
          </div>
        </div>

        {/* AI Verification & Quality Assurance Info */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  AI Quality Guarantee
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Verified Mandi
              </span>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">
                    YOLO-Graded Tomato Lots
                  </strong>
                  <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                    Produce lots marked with the AI Verified badge have undergone computer vision quality grading with verified defect rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">
                    Digital QR Certificates
                  </strong>
                  <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                    Every certified lot comes with an immutable digital certificate. Scan the QR code or click the public verification link to verify farmer authenticity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">
                    Direct Farm Sourcing
                  </strong>
                  <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                    Eliminate intermediary markups by purchasing directly from certified tomato growers across regional APMC mandis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-2">
            <Link
              to="/buyer/marketplace"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 text-xs font-bold text-white shadow-xs transition-colors hover:bg-brand-800"
            >
              <span>Explore Verified Produce Lots</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <RecentOrdersTable orders={dashboard.recentOrders} role="buyer" />
    </div>
  );
}
