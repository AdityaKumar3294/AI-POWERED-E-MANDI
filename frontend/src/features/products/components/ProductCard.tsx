import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, User, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import { uploadUrl } from '@/lib/api';
import { formatWeight } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import { PriceText } from '@/components/ui/PriceText';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isCertified = Boolean(product.certificateId && product.certificateId.valid);
  const imageUrl = uploadUrl(product.image);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900">
      {/* Produce Image Container with fixed aspect ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-850">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-produce.svg';
          }}
        />

        {/* Floating Grade Pill */}
        <div className="absolute top-3 left-3">
          <GradePill grade={product.grade} size="sm" />
        </div>

        {/* Quality Verified Badge */}
        {isCertified && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>AI Verified</span>
          </div>
        )}

        {/* Available Stock Pill */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-stone-900/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
          {product.quantity > 0 ? (
            <span>Stock: {formatWeight(product.quantity)}</span>
          ) : (
            <span className="text-red-400 font-semibold">Sold Out</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-stone-900 group-hover:text-brand-700 dark:text-stone-100 dark:group-hover:text-brand-400 transition">
            {product.name}
          </h3>

          {/* Farmer & Location details */}
          <div className="mt-2 space-y-1 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{product.farmerId?.name || 'Local Farmer'}</span>
            </div>
            {product.farmerId?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{product.farmerId.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
          <div>
            <span className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              Wholesale Rate
            </span>
            <PriceText amount={product.pricePerKg} perKg className="text-xl font-extrabold text-brand-800 dark:text-brand-400" />
          </div>

          <Link
            to={`/buyer/product/${product._id}`}
            className="touch-target inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3.5 py-2 text-sm font-bold text-brand-800 hover:bg-brand-700 hover:text-white dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-700 dark:hover:text-white transition shadow-xs"
          >
            <span>Order</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

