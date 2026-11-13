import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Package, 
  Sparkles, 
  Scale, 
  Store, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { useMyProducts, useDeleteProduct } from '../hooks';
import { FarmerProductCard } from '../components/FarmerProductCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatWeight } from '@/lib/format';
import type { Product, ProductStatus } from '@/types';

type FilterTab = 'all' | ProductStatus;

export default function FarmerProductsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useMyProducts();
  const deleteProductMutation = useDeleteProduct();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const products = data?.products || [];

  // Metrics summary
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const availableCount = products.filter((p) => p.status === 'available').length;
    const soldOutCount = products.filter((p) => p.status === 'sold_out').length;
    const inactiveCount = products.filter((p) => p.status === 'inactive').length;
    const certifiedCount = products.filter((p) => Boolean(p.certificateId)).length;
    const totalWeightKg = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

    return {
      totalCount,
      availableCount,
      soldOutCount,
      inactiveCount,
      certifiedCount,
      totalWeightKg,
    };
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesTab = activeTab === 'all' || product.status === activeTab;
      const matchesSearch =
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesTab && matchesSearch;
    });
  }, [products, activeTab, searchQuery]);

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;
    deleteProductMutation.mutate(productToDelete._id, {
      onSettled: () => {
        setProductToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <title>My Produce Listings | AI E-Mandi Farmer Portal</title>
      <meta
        name="description"
        content="Manage your wholesale tomato harvest listings, stock volumes, and AI-certified produce lots on AI-Powered E-Mandi."
      />

      {/* Header and CTA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            My Produce Listings
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Manage your harvest inventory, adjust wholesale pricing, and publish AI-certified lots to buyers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/farmer/grading"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-100 focus:ring-2 focus:ring-brand-500/20 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Grade Crops</span>
          </Link>

          <Link
            to="/farmer/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <Plus className="h-5 w-5" />
            <span>List New Produce</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Package className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Listings</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-100">
            {metrics.totalCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Active Lots</span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {metrics.availableCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inventory</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-100">
            {formatWeight(metrics.totalWeightKg)}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">AI Certified</span>
          </div>
          <p className="mt-2 text-2xl font-black text-brand-700 dark:text-brand-400">
            {metrics.certifiedCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs md:flex-row md:items-center md:justify-between dark:border-stone-800 dark:bg-stone-900">
        {/* Status Filter Tabs */}
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
            All Lots ({metrics.totalCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            🟢 Available ({metrics.availableCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sold_out')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'sold_out'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            ⚪ Sold Out ({metrics.soldOutCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inactive')}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'inactive'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            🟡 Inactive ({metrics.inactiveCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] md:max-w-xs">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search produce name..."
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
          />
        </div>
      </div>

      {/* Main Grid or Status Displays */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <Skeleton className="aspect-4/3 w-full rounded-xl" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Listings"
          message="Could not load your farm listings from the mandi server. Please verify your connection."
          onRetry={refetch}
        />
      ) : filteredProducts.length === 0 ? (
        products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Produce Listed Yet"
            description="You haven't listed any harvest lots on the marketplace yet. You can list produce directly or grade your tomatoes first for a digital certificate."
            action={{
              label: 'List Your First Produce',
              onClick: () => navigate('/farmer/products/new'),
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-stone-700 dark:bg-stone-900">
            <AlertCircle className="h-12 w-12 text-stone-400" />
            <h3 className="mt-3 text-lg font-bold text-stone-800 dark:text-stone-200">
              No matching lots found
            </h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Try adjusting your search query or switching to another status tab.
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <FarmerProductCard
              key={product._id}
              product={product}
              onDeleteRequested={(p) => setProductToDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Delete Produce Listing?"
        description={
          productToDelete
            ? `Are you sure you want to permanently delete "${productToDelete.name}" (${formatWeight(
                productToDelete.quantity
              )})? If this lot has existing buyer orders, the mandi server will reject deletion to protect audit records. In that case, you can mark it as "Inactive" instead.`
            : ''
        }
        confirmLabel={deleteProductMutation.isPending ? 'Deleting...' : 'Delete Listing'}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
