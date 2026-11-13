import { useSearchParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { useProducts } from '../hooks';
import { MarketplaceFilters } from '../components/MarketplaceFilters';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { ProduceGrade } from '@/types';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query filters from URL
  const filters = {
    search: searchParams.get('search') || undefined,
    grade: (searchParams.get('grade') as ProduceGrade) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'createdAt' | 'pricePerKg' | 'name' | 'quantity') || 'createdAt',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  };

  const { data, isLoading, isError, error, refetch } = useProducts(filters);

  const products = data?.products || [];
  const totalCount = data?.count ?? products.length;

  return (
    <div className="space-y-6">
      {/* React 19 Document Metadata */}
      <title>Marketplace | AI-Powered E-Mandi</title>
      <meta
        name="description"
        content="Browse and order verified agricultural produce directly from Indian farmers with AI quality grading."
      />

      {/* Page Title & Stats */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
              Produce Marketplace
            </h1>
            {!isLoading && (
              <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {totalCount} {totalCount === 1 ? 'Lot' : 'Lots'} Available
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            मंडी में उपलब्ध ताज़ा एवं सत्यापित कृषि उपज खरीदें
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <MarketplaceFilters />

      {/* Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load marketplace"
          message={(error as any)?.message || 'Failed to fetch produce listings from the server.'}
          onRetry={() => refetch()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No produce listings found"
          description={
            filters.search || filters.grade || filters.minPrice || filters.maxPrice
              ? 'No produce matches your current filters. Try resetting your search or adjusting the price/grade filters.'
              : 'There are currently no active produce listings available in the mandi. Please check back later.'
          }
          action={{
            label: 'Clear All Filters',
            onClick: () => setSearchParams({}),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
