import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  Store, 
  Scale, 
  Coins, 
  ArrowRight, 
  MapPin 
} from 'lucide-react';
import { useFarmerDashboard } from '../hooks';
import { useAuthStore } from '@/stores/auth';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { OrderStatusDonut } from '../components/OrderStatusDonut';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatWeight } from '@/lib/format';

export default function FarmerDashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useFarmerDashboard();

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
        message="Could not load your farm performance data from the mandi server. Please verify your connection."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-8">
      <title>Farmer Dashboard | AI-Powered E-Mandi</title>
      <meta
        name="description"
        content="Overview of your mandi sales revenue, active tomato harvest stock, order progress, and AI quality grading certificates."
      />

      {/* Greeting and Farm Location */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            Welcome back, {user?.name || 'Farmer'}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Farm Location: {user?.location || 'Mandi Region'} • Producer Account</span>
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/farmer/grading"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/60 dark:text-brand-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Grade Tomatoes</span>
          </Link>

          <Link
            to="/farmer/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <Plus className="h-4 w-4" />
            <span>List Harvest Lot</span>
          </Link>
        </div>
      </div>

      {/* Top Key Metric KPI Cards with Animated Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Completed Revenue */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Completed Sales
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-700 sm:text-3xl dark:text-emerald-400">
            <AnimatedCounter
              value={dashboard.sales.completedSalesAmount}
              formatter={(v) => formatCurrency(v)}
            />
          </p>
          <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
            From fulfilled consignments
          </span>
        </div>

        {/* Total Harvest Inventory */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Harvest Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-100">
            <AnimatedCounter
              value={dashboard.products.totalStockKg}
              formatter={(v) => formatWeight(v)}
            />
          </p>
          <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
            Available across active lots
          </span>
        </div>

        {/* Active Produce Listings */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Active Lots
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-100">
            <AnimatedCounter value={dashboard.products.available} />
            <span className="text-sm font-semibold text-stone-400">
              {' '}/ {dashboard.products.total} lots
            </span>
          </p>
          <Link
            to="/farmer/products"
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline dark:text-brand-400"
          >
            <span>Manage listings</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* AI Certificates Issued */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              AI Certificates
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-brand-700 sm:text-3xl dark:text-brand-400">
            <AnimatedCounter value={dashboard.aiGrading.totalCertificates} />
            <span className="text-sm font-semibold text-stone-400">
              {' '}/ {dashboard.aiGrading.totalReports} scans
            </span>
          </p>
          <Link
            to="/farmer/certificates"
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline dark:text-brand-400"
          >
            <span>View certificates</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Middle Section: Orders Donut Chart & Inventory Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Fulfillment Status Donut */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Order Fulfillment Status
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Distribution of buyer orders across transaction milestones.
              </p>
            </div>
            <Link
              to="/farmer/orders"
              className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-400"
            >
              Order portal
            </Link>
          </div>

          <div className="mt-6">
            <OrderStatusDonut orders={dashboard.orders} />
          </div>
        </div>

        {/* Harvest Inventory & Listing Distribution */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Harvest Inventory Status
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Current marketplace lot availability and stock reserves.
                </p>
              </div>
              <Link
                to="/farmer/products"
                className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-400"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-600" />
                  <div>
                    <span className="block text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      Available in Mandi
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">
                      Live and visible to wholesale buyers
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                  {dashboard.products.available} lots
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-stone-100 p-4 dark:bg-stone-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 rounded-full bg-stone-500" />
                  <div>
                    <span className="block text-sm font-bold text-stone-800 dark:text-stone-200">
                      Sold Out
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      All harvest volume depleted by buyer orders
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black text-stone-700 dark:text-stone-300">
                  {dashboard.products.soldOut} lots
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 dark:bg-amber-950/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 rounded-full bg-amber-600" />
                  <div>
                    <span className="block text-sm font-bold text-amber-950 dark:text-amber-100">
                      Temporarily Inactive
                    </span>
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      Hidden from marketplace browsing
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-800 dark:text-amber-300">
                  {dashboard.products.inactive} lots
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-950/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
                  Total Farm Volume Listed
                </span>
                <p className="text-xs text-brand-700 dark:text-brand-400">
                  Across all active listings ready for dispatch
                </p>
              </div>
              <span className="text-xl font-extrabold text-brand-800 dark:text-brand-300">
                {formatWeight(dashboard.products.totalStockKg)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <RecentOrdersTable orders={dashboard.recentOrders} role="farmer" />
    </div>
  );
}
