import { useOptimistic, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  Scale, 
  Tag, 
  Coins 
} from 'lucide-react';
import type { Product, ProductStatus } from '@/types';
import { uploadUrl } from '@/lib/api';
import { formatCurrency, formatWeight, formatDate } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUpdateProductStatus } from '../hooks';

interface FarmerProductCardProps {
  product: Product;
  onDeleteRequested: (product: Product) => void;
}

export function FarmerProductCard({ product, onDeleteRequested }: FarmerProductCardProps) {
  const updateStatusMutation = useUpdateProductStatus();
  const [, startTransition] = useTransition();

  // React 19 useOptimistic for instant local UI update when farmer changes produce status
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    product.status,
    (_currentStatus: ProductStatus, newStatus: ProductStatus) => newStatus
  );

  const handleStatusChange = (newStatus: ProductStatus) => {
    if (newStatus === optimisticStatus) return;

    startTransition(() => {
      setOptimisticStatus(newStatus);
      updateStatusMutation.mutate({ id: product._id, status: newStatus });
    });
  };

  const isCertified = Boolean(product.certificateId);
  const totalValue = (product.quantity || 0) * (product.pricePerKg || 0);

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs transition-all hover:border-brand-500 hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <div>
        {/* Produce Image & Top Badges */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={uploadUrl(product.image)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Grade Badge */}
          <div className="absolute top-3 left-3">
            <GradePill grade={product.grade} size="sm" />
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={optimisticStatus} />
          </div>

          {/* AI Verification Ribbon */}
          {isCertified && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-emerald-700/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
              <span>AI Quality Certified</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-1 text-lg font-bold text-stone-900 dark:text-stone-100">
                {product.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Listed on {formatDate(product.createdAt)}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-800/60">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <div>
                <span className="block text-stone-500 dark:text-stone-400">Rate / Kg</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {formatCurrency(product.pricePerKg)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <div>
                <span className="block text-stone-500 dark:text-stone-400">Available Stock</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {formatWeight(product.quantity)}
                </span>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between border-t border-stone-200/80 pt-2 dark:border-stone-700/80">
              <span className="flex items-center gap-1.5 font-medium text-stone-600 dark:text-stone-300">
                <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Est. Lot Value:
              </span>
              <span className="text-sm font-extrabold text-brand-700 dark:text-brand-400">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          {/* Quick Status Selector */}
          <div className="mt-4">
            <label
              htmlFor={`status-select-${product._id}`}
              className="mb-1 block text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              Listing Visibility Status:
            </label>
            <select
              id={`status-select-${product._id}`}
              value={optimisticStatus}
              disabled={updateStatusMutation.isPending}
              onChange={(e) => handleStatusChange(e.target.value as ProductStatus)}
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-800 shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <option value="available">🟢 Available (Live in Marketplace)</option>
              <option value="sold_out">⚪ Sold Out (Out of Stock)</option>
              <option value="inactive">🟡 Inactive (Hidden from Buyers)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card Action Buttons Footer */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 border-t border-stone-200 bg-stone-50/60 dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900/40">
        <Link
          to={`/farmer/products/${product._id}/edit`}
          className="flex h-12 items-center justify-center gap-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-brand-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-brand-400"
          title="Edit Lot Details"
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </Link>

        <Link
          to={`/buyer/product/${product._id}`}
          className="flex h-12 items-center justify-center gap-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-brand-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-brand-400"
          title="View Live Listing in Marketplace"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View</span>
        </Link>

        <button
          type="button"
          onClick={() => onDeleteRequested(product)}
          className="flex h-12 items-center justify-center gap-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
          title="Delete Product"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
